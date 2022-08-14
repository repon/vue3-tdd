import SignUpPage from "./SignUpPage.vue";
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/vue";
import { setupServer } from "msw/node";
import { rest } from "msw";

describe("SignUpPage", () => {
  beforeEach(() => {
    render(SignUpPage)
  })
  afterEach(cleanup);

  describe("レイアウト", () => {
    it("Sign Upヘッダーが表示される", () => {
      const header = screen.getByRole("heading", { name: "Sign Up" });
      expect(header).toBeTruthy();
    });

    it("ユーザー名の入力フォームが表示される", () => {
      const input = screen.queryByLabelText("ユーザー名");
      expect(input).toBeTruthy();
    });

    it("Eメールの入力フォームが表示される", () => {
      const input = screen.queryByLabelText("メールアドレス");
      expect(input).toBeTruthy();
    });

    it("パスワードが表示される", () => {
      const input = screen.queryByLabelText("パスワード");
      expect(input).toBeTruthy();
    });

    it("パスワードの確認が表示される", () => {
      const input = screen.queryByLabelText("パスワードの確認");
      expect(input).toBeTruthy();
    });

    it("パスワードの入力フォームのtypeがpasswordであること", () => {
      const input = screen.getByLabelText("パスワード");
      expect(input.type).toBe("password");
    });

    it("パスワードの確認の入力フォームのtypeがpasswordであること", () => {
      const input = screen.getByLabelText("パスワードの確認");
      expect(input.type).toBe("password");
    });

    it("登録用のボタンが表示される", () => {
      const button = screen.getByRole("button", { name: "登録" });
      expect(button).toBeTruthy();
    });

    it("登録ボタンが初期表示時はdisableとなっている", () => {
      const button = screen.getByRole("button", { name: "登録" });
      expect(button.disabled).toBeTruthy();
    });
  });

  describe("インタラクション", () => {
    // モックサーバー準備
    let requestBody;
    const server = setupServer(
      rest.post("/api/v1/users", async (req, res, ctx) => {
        requestBody = await req.json();
        if (requestBody.username === "Error1") {
          return res(
            ctx.status(500),
            ctx.json({
              error: {
                message: "サーバーエラーです。時間をおいて試してください",
              },
            })
          );
        }
        return res(ctx.status(200));
      })
    );

    async function responseServerCheck(username) {
      server.listen();
      await fillAllForm(username, "user@example.com", "P4ssw0rd", "P4ssw0rd");
      const button = screen.getByRole("button", { name: "登録" });
      await fireEvent.click(button);
      await server.close();
    }

    it("全フォームを入力済み、かつパスワードとパスワード確認が同じ値の場合、登録のdisabledが解除される", async () => {
      await fillAllForm("Usern", "user@example.com", "P4ssw0rd", "P4ssw0rd");
      const button = screen.getByRole("button", { name: "登録" });
      expect(button.disabled).toBe(false);
    });

    it("全フォームを入力済みでも、パスワードとパスワードの確認が不一致の場合、登録ボタンがdisabledになる", async () => {
      await fillAllForm("Usern", "user@example.com", "P4ssw0rd", "P5ssw0rd");
      const button = screen.getByRole("button", { name: "登録" });
      expect(button.disabled).toBe(true);
    });

    async function fillAllForm(username, email, password, confirmPassword) {
      const usernameInput = screen.getByLabelText("ユーザー名");
      const emailInput = screen.getByLabelText("メールアドレス");
      const passwordInput = screen.getByLabelText("パスワード");
      const confirmPasswordInput = screen.getByLabelText("パスワードの確認");
      await fireEvent.update(usernameInput, username);
      await fireEvent.update(emailInput, email);
      await fireEvent.update(passwordInput, password);
      await fireEvent.update(confirmPasswordInput, confirmPassword);
    }

    it("登録ボタン押下時にユーザー名、メールアドレス、パスワードをサーバに送信する", async () => {
      await responseServerCheck("Usern");
      expect(requestBody).toEqual({
        username: "Usern",
        email: "user@example.com",
        password: "P4ssw0rd",
      });
    });

    it("登録時にサーバーからエラーが返された場合、エラーメッセージを表示する", async () => {
      await responseServerCheck("Error1");

      const text = await screen.findByText(
        "サーバーエラーです。時間をおいて試してください"
      );
      expect(text).toBeTruthy();
    });
  });
});
