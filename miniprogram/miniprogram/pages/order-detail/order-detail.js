"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orders_1 = require("../../services/orders");
const account_1 = require("../../utils/account");
const format_1 = require("../../utils/format");
const identity_1 = require("../../utils/identity");
const DEADLINE_HOURS = 3;
let countdownTimer = 0;
Page({
    data: {
        orderId: 0,
        loading: true,
        order: null,
        stageTitle: '',
        stageSub: '',
        isRunner: false,
        isPublisher: false,
        showReminder: false,
        reminderText: '',
        actionText: '',
        actionWarning: false,
        actionDanger: false,
        actionDisabled: false,
        countdownText: '',
        countdownExpired: false,
        contactLabel: '',
        contactOtherId: 0,
    },
    onLoad(options) {
        const id = Number(options.id) || 0;
        this.setData({ orderId: id });
        this.loadOrder();
    },
    onUnload() {
        if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = 0;
        }
    },
    async loadOrder() {
        try {
            const order = await (0, orders_1.getOrder)(this.data.orderId);
            const display = (0, format_1.decorateOrder)(order);
            const currentUserId = (0, account_1.getCurrentUserId)();
            const isRunner = display.acceptedById === currentUserId;
            const isPublisher = display.creatorId === currentUserId;
            const stage = this.stageFor(display.status, isRunner, isPublisher);
            let contactLabel = '';
            let contactOtherId = 0;
            if (isRunner && display.creatorId > 0) {
                contactLabel = '联系发布者';
                contactOtherId = display.creatorId;
            }
            else if (isPublisher && display.acceptedById) {
                contactLabel = '联系接单员';
                contactOtherId = display.acceptedById;
            }
            this.setData({
                order: display,
                loading: false,
                isRunner,
                isPublisher,
                stageTitle: stage.title,
                stageSub: stage.sub,
                contactLabel,
                contactOtherId,
            });
            this.applyActions(display.status, isRunner, isPublisher, display.createdAt);
        }
        catch {
            wx.showToast({ title: '加载失败，请确认后端已启动', icon: 'none' });
            this.setData({ loading: false });
        }
    },
    stageFor(status, isRunner, isPublisher) {
        switch (status) {
            case 'OPEN':
                return isPublisher
                    ? { title: '等待接单', sub: '订单发布成功，等待骑手接单' }
                    : { title: '等待接单', sub: '订单尚未被抢，请尽快抢单' };
            case 'ACCEPTED':
                return { title: '进行中', sub: '订单进行中，完成后请点击确认完成' };
            case 'COMPLETION_PENDING':
                return isPublisher
                    ? { title: '进行中', sub: '接单员已提交完成，请确认' }
                    : { title: '进行中', sub: '已提交完成，等待发布者确认' };
            case 'DONE':
                return { title: '已完成', sub: '本订单已完成' };
            default:
                return { title: '订单详情', sub: '' };
        }
    },
    applyActions(status, isRunner, isPublisher, createdAt) {
        let actionText = '';
        let actionWarning = false;
        let actionDanger = false;
        let actionDisabled = false;
        let showReminder = false;
        let reminderText = '';
        this.setData({
            showReminder: false,
            reminderText: '',
            actionText: '',
            actionWarning: false,
            actionDanger: false,
            actionDisabled: false,
            countdownExpired: false,
        });
        if (status === 'OPEN') {
            if (isPublisher) {
                actionText = '撤回任务';
                actionDanger = true;
            }
            else {
                this.startCountdown(createdAt);
                return;
            }
        }
        else if (status === 'ACCEPTED') {
            if (isRunner || isPublisher) {
                actionText = '确认完成';
                actionWarning = true;
            }
            else {
                actionText = '进行中';
                actionDisabled = true;
            }
        }
        else if (status === 'COMPLETION_PENDING') {
            if (isPublisher) {
                showReminder = true;
                reminderText = '接单员已提交完成，请点击确认完成';
                actionText = '确认完成';
                actionWarning = true;
            }
            else {
                actionText = '等待发布者确认';
                actionDisabled = true;
            }
        }
        this.setData({ actionText, actionWarning, actionDanger, actionDisabled, showReminder, reminderText });
    },
    startCountdown(createdAt) {
        const deadline = new Date(createdAt).getTime() + DEADLINE_HOURS * 3600 * 1000;
        const tick = () => {
            const remain = deadline - Date.now();
            if (remain <= 0) {
                this.setData({ countdownExpired: true, actionText: '已截止' });
                if (countdownTimer) {
                    clearInterval(countdownTimer);
                    countdownTimer = 0;
                }
                return;
            }
            const pad = (n) => String(n).padStart(2, '0');
            const h = Math.floor(remain / 3600000);
            const m = Math.floor((remain % 3600000) / 60000);
            const s = Math.floor((remain % 60000) / 1000);
            this.setData({
                countdownText: `${pad(h)}:${pad(m)}:${pad(s)}`,
                actionText: `抢单 (${pad(h)}:${pad(m)}:${pad(s)})`,
                actionWarning: false,
                actionDisabled: false,
            });
        };
        tick();
        countdownTimer = setInterval(tick, 1000);
    },
    onContact() {
        const { orderId, contactOtherId } = this.data;
        if (!contactOtherId) {
            return;
        }
        wx.navigateTo({
            url: `/pages/chat/chat?orderId=${orderId}&otherUserId=${contactOtherId}`,
        });
    },
    onAction() {
        const { order, isPublisher, isRunner, countdownExpired } = this.data;
        if (!order) {
            return;
        }
        if (order.status === 'OPEN') {
            if (isPublisher) {
                this.onCancel();
            }
            else if (!countdownExpired) {
                this.onAccept();
            }
            return;
        }
        if (order.status === 'ACCEPTED' || order.status === 'COMPLETION_PENDING') {
            if (isPublisher) {
                this.onConfirm();
            }
            else if (isRunner) {
                this.onDone();
            }
        }
    },
    async onCancel() {
        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: '撤回任务',
                content: '确定撤回这个任务吗？撤回后任务将下架',
                success: (res) => resolve(res.confirm),
                fail: () => resolve(false),
            });
        });
        if (!confirmed) {
            return;
        }
        try {
            await (0, orders_1.cancelOrder)(this.data.orderId);
            wx.showToast({ title: '已撤回', icon: 'success' });
            this.loadOrder();
        }
        catch (err) {
            wx.showToast({ title: err.message || '撤回失败', icon: 'none' });
        }
    },
    async onAccept() {
        if (this.data.countdownExpired) {
            return;
        }
        const canGrab = await (0, identity_1.ensureRunnerIdentity)();
        if (!canGrab) {
            return;
        }
        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: '确认抢单',
                content: '确定抢下这个订单吗？',
                success: (res) => resolve(res.confirm),
                fail: () => resolve(false),
            });
        });
        if (!confirmed) {
            return;
        }
        try {
            await (0, orders_1.acceptOrder)(this.data.orderId, (0, account_1.getCurrentUserId)());
            wx.showToast({ title: '抢单成功', icon: 'success' });
            this.loadOrder();
        }
        catch (err) {
            wx.showToast({ title: err.message || '抢单失败', icon: 'none' });
        }
    },
    async onDone() {
        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: '确认完成',
                content: '确定提交完成并等待发布者确认吗？',
                success: (res) => resolve(res.confirm),
                fail: () => resolve(false),
            });
        });
        if (!confirmed) {
            return;
        }
        try {
            await (0, orders_1.doneOrder)(this.data.orderId);
            wx.showToast({ title: '已提交确认', icon: 'success' });
            this.loadOrder();
        }
        catch (err) {
            wx.showToast({ title: err.message || '操作失败', icon: 'none' });
        }
    },
    async onConfirm() {
        const confirmed = await new Promise((resolve) => {
            wx.showModal({
                title: '确认完成',
                content: '确定该订单已完成吗？确认后订单将自动完成',
                success: (res) => resolve(res.confirm),
                fail: () => resolve(false),
            });
        });
        if (!confirmed) {
            return;
        }
        try {
            await (0, orders_1.confirmOrder)(this.data.orderId);
            wx.showToast({ title: '订单已完成', icon: 'success' });
            this.loadOrder();
        }
        catch (err) {
            wx.showToast({ title: err.message || '操作失败', icon: 'none' });
        }
    },
});
