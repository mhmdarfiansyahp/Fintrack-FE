<template>
  <div class="login-container">
    <div class="login-card">
      <h2>FinTrack</h2>
      <p class="subtitle">Sign in to continue</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="email"
            placeholder="Enter your email"
            required />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            type="password"
            v-model="password"
            placeholder="Enter your password"
            required />
        </div>

        <button type="submit">
          Login
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      error: null
    }
  },
  methods: {
    handleLogin() {
      const dummyEmail = "admin@gmail.com"
      const dummyPassword = "123456"

      if (this.email === dummyEmail && this.password === dummyPassword) {
        localStorage.setItem("isLoggedIn", "true")
        this.$router.push("/")
      } else {
        this.error = "Email atau password salah!"
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
}

.login-card {
  background: white;
  padding: 40px;
  width: 380px;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
  text-align: center;
}

.subtitle {
  color: #777;
  margin-bottom: 20px;
}

.form-group {
  text-align: left;
  margin-bottom: 15px;
}

input {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-top: 5px;
}

button {
  width: 100%;
  padding: 12px;
  background: #2c5364;
  color: white;
  border: none;
  border-radius: 8px;
  margin-top: 15px;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background: #203a43;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>