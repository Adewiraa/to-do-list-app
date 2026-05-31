# Run this script to test the Laravel API!
$server = "http://127.0.0.1:8000"
Clear-Host
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "     TO DO LIST API TESTING SCRIPT        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Connecting to Laravel API at $server/api/v1..." -ForegroundColor Gray

# 1. Login to get Bearer Token
$loginBody = @{
    email = "test@example.com"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$server/api/v1/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.access_token
    $userName = $loginResponse.data.user.name
    Write-Host "`n[1] LOGIN SUCCESSFUL" -ForegroundColor Green
    Write-Host " -> Logged in as: $userName" -ForegroundColor White
    Write-Host " -> Token generated: Bearer $token" -ForegroundColor Gray
    
    # Header Authorization
    $headers = @{
        Authorization = "Bearer $token"
        Accept = "application/json"
    }

    # 2. Get Dashboard Summary
    $summaryResponse = Invoke-RestMethod -Uri "$server/api/v1/dashboard/summary" -Method Get -Headers $headers
    Write-Host "`n[2] DASHBOARD SUMMARY" -ForegroundColor Green
    Write-Host " -> Total Tasks: $($summaryResponse.data.task_statistics.total)" -ForegroundColor Yellow
    Write-Host " -> Completed Tasks: $($summaryResponse.data.task_statistics.done)" -ForegroundColor Yellow
    Write-Host " -> Pending Tasks: $($summaryResponse.data.task_statistics.pending)" -ForegroundColor Yellow
    Write-Host " -> Overdue Tasks (Terlambat): $($summaryResponse.data.task_statistics.overdue)" -ForegroundColor Yellow
    Write-Host " -> Due Today (Tenggat Hari Ini): $($summaryResponse.data.task_statistics.due_today)" -ForegroundColor Yellow
    Write-Host " -> Completion Rate: $($summaryResponse.data.task_statistics.completion_rate_percentage)%" -ForegroundColor Yellow

    # 3. Get Tasks List
    $tasksResponse = Invoke-RestMethod -Uri "$server/api/v1/tasks?per_page=3" -Method Get -Headers $headers
    Write-Host "`n[3] TASKS LIST (Top 3)" -ForegroundColor Green
    foreach ($task in $tasksResponse.data.data) {
        $categoryName = $task.category ? $task.category.name : "Uncategorized"
        Write-Host " -> [$($task.status.ToUpper())] $($task.title) | Category: $categoryName | Priority: $($task.priority)" -ForegroundColor White
    }

    Write-Host "`n==========================================" -ForegroundColor Cyan
    Write-Host "    ✓ ALL API INTEGRITY CHECKS PASSED     " -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan

} catch {
    Write-Host "`n[x] CONNECTION ERROR" -ForegroundColor Red
    Write-Host " -> Gagal terhubung ke API." -ForegroundColor Red
    Write-Host " -> Pastikan server Laravel sudah dijalankan dengan perintah:" -ForegroundColor Yellow
    Write-Host "    C:\laragon\bin\php\php-8.3.28-Win32-vs16-x64\php.exe artisan serve" -ForegroundColor Yellow
    Write-Host " -> Error detail: $($_.Exception.Message)" -ForegroundColor Red
}
