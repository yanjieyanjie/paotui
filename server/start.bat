@echo off
title 校园跑腿服务 - 后端启动
cd /d "%~dp0"
echo ============================================
echo    校园跑腿服务后端 - 一键启动
echo ============================================
echo.
echo [1/3] 构建代码（npm run build）...
call npm run build
if errorlevel 1 (
    echo.
    echo [错误] 构建失败，请检查代码后重试。
    pause
    exit /b 1
)
echo.
echo [2/3] 检查 3000 端口...
netstat -ano | findstr ":3000 " | findstr "LISTENING" >nul
if %errorlevel%==0 (
    echo [提示] 3000 端口已被占用，正在关闭旧进程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
    ping -n 3 127.0.0.1 >nul
) else (
    echo [OK] 3000 端口空闲。
)
echo.
echo [3/3] 启动服务（关闭此窗口或 Ctrl+C 即停止）...
echo.
call npm start
echo.
echo 服务已停止。
pause