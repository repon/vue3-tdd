<template>
  <form>
    <h1>Sign Up</h1>
    <label for="username">ユーザー名</label>
    <input id="username" type="text" v-model="username" />
    <label for="email">メールアドレス</label>
    <input id="email" type="text" v-model="email" />
    <label for="password">パスワード</label>
    <input id="password" type="password" v-model="password" />
    <label for="confirm_password">パスワードの確認</label>
    <input id="confirm_password" type="password" v-model="confirm_password" />
    <button :disabled="isDisabled" @click.prevent="submit">登録</button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </form>
</template>

<script>
import axios from "axios";

export default {
  name: "SignUpPage",
  data() {
    return {
      username: "",
      email: "",
      password: "",
      confirm_password: "",
      errorMessage: "",
    };
  },
  computed: {
    isDisabled() {
      if (
        this.username &&
        this.email &&
        this.password &&
        this.password === this.confirm_password
      )
        return false;
      return true;
    },
  },
  methods: {
    async submit() {
      try {
        await axios.post("/api/v1/users", {
          username: this.username,
          email: this.email,
          password: this.password,
        });
      } catch (error) {
        this.errorMessage = error.response.data.error.message;
      }
    },
  },
};
</script>
