# 🚀 Laravel Backend Setup untuk Bioskop

## 📋 Requirements
- PHP 8.1+
- Composer
- MySQL/PostgreSQL
- Laravel 10+

## 🛠️ Setup Laravel Backend

### 1. Create Laravel Project
```bash
composer create-project laravel/laravel bioskop-backend
cd bioskop-backend
```

### 2. Database Configuration
Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bioskop_db
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Install Laravel Sanctum
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 4. API Routes (routes/api.php)
```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'profile']);
    Route::put('/user/update', [UserController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
```

### 5. AuthController (app/Http/Controllers/AuthController.php)
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => $user
            ]);
        }

        return response()->json([
            'message' => 'Email atau password salah'
        ], 401);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user'
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
```

### 6. UserController (app/Http/Controllers/UserController.php)
```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'old_password' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($request->password) {
            if (!Hash::check($request->old_password, $user->password)) {
                return response()->json([
                    'message' => 'Password lama tidak sesuai'
                ], 400);
            }
            $user->password = Hash::make($request->password);
        }

        $user->update($request->only(['name', 'email', 'phone']));
        
        return response()->json($user);
    }
}
```

### 7. User Migration
```bash
php artisan make:migration add_fields_to_users_table
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable();
            $table->string('role')->default('user');
            $table->text('profile')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'profile']);
        });
    }
};
```

### 8. CORS Configuration (config/cors.php)
```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### 9. Run Migrations & Seed
```bash
php artisan migrate
php artisan db:seed --class=UserSeeder
```

### 10. UserSeeder (database/seeders/UserSeeder.php)
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin user
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@bioskop.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'phone' => '081234567890'
        ]);

        // Regular user
        User::create([
            'name' => 'John Doe',
            'email' => 'user@bioskop.com',
            'password' => Hash::make('user123'),
            'role' => 'user',
            'phone' => '081234567891'
        ]);
    }
}
```

### 11. Start Laravel Server
```bash
php artisan serve
```

## 🎯 Test Credentials
- **Admin**: admin@bioskop.com / admin123
- **User**: user@bioskop.com / user123

## 📡 API Endpoints
- POST `/api/login` - Login
- POST `/api/register` - Register
- GET `/api/user` - Get profile (auth required)
- PUT `/api/user/update` - Update profile (auth required)
- POST `/api/logout` - Logout (auth required)

Laravel backend akan berjalan di `http://localhost:8000`