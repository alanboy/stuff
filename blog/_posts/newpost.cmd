
@echo off

set postTitle=%1
if /i [%postTitle:~-9%]==[.markdown] (
    echo Do not end your title with .markdown
    goto :eof
)

For /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
For /f "tokens=1-2 delims=/: " %%a in ('time /t') do (set mytime=%%a:%%b:00)

set filename=%mydate%-%1.markdown

IF EXIST "%filename%" (
    echo File already exists: %filename%
    echo.
    goto :eof
)

echo ---> %filename%
echo layout: post>> %filename%
echo title: "%1">> %filename%
echo date: %mydate% %mytime% -0800>> %filename%
echo categories: %1>> %filename%
echo --->> %filename%
echo.>> %filename%
echo.>> %filename%
git add %filename%
echo File created and added to source control: %filename%
echo.

