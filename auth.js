const supabaseUrl =
  "https://ktnalbuhlfrmgkmivubj.supabase.co";

const supabaseKey =
  "sb_publishable_TmTgUV4k6o6bR8ik21EiDg_7BvGKYb4";

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

const appUrl =
  "https://anni-gold-music.netlify.app";


/* =========================================
   HILFSFUNKTIONEN
========================================= */

function statusAnzeigen(element, text) {
  if (!element) {
    return;
  }

  element.textContent = text;
}

function buttonSperren(button, gesperrt) {
  if (!button) {
    return;
  }

  button.disabled = gesperrt;

  if (gesperrt) {
    button.style.opacity = "0.65";
    button.style.cursor = "not-allowed";
  } else {
    button.style.opacity = "1";
    button.style.cursor = "pointer";
  }
}


/* =========================================
   REGISTRIERUNG
========================================= */

const registerForm =
  document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      const artistName =
        document.getElementById("artistName").value.trim();

      const username =
        document.getElementById("username").value.trim();

      const email =
        document.getElementById("email").value.trim();

      const password =
        document.getElementById("password").value;

      const discordElement =
        document.getElementById("discord");

      const tiktokElement =
        document.getElementById("tiktok");

      const discord = discordElement
        ? discordElement.value.trim()
        : "";

      const tiktok = tiktokElement
        ? tiktokElement.value.trim()
        : "";

      const status =
        document.getElementById("status");

      const submitButton =
        registerForm.querySelector(
          'button[type="submit"]'
        );

      if (
        !artistName ||
        !username ||
        !email ||
        !password
      ) {
        statusAnzeigen(
          status,
          "Bitte fülle alle Pflichtfelder aus ❌"
        );

        return;
      }

      if (password.length < 6) {
        statusAnzeigen(
          status,
          "Das Passwort muss mindestens 6 Zeichen lang sein ❌"
        );

        return;
      }

      buttonSperren(submitButton, true);

      statusAnzeigen(
        status,
        "Registrierung wird gesendet..."
      );

      try {
        const { data, error } =
          await supabaseClient.auth.signUp({
            email: email,
            password: password,

            options: {
              data: {
                artist_name: artistName,
                username: username,
                discord: discord,
                tiktok: tiktok
              },

              emailRedirectTo:
                appUrl + "/login.html"
            }
          });

        if (error) {
          throw error;
        }

        console.log(
          "Registrierung erfolgreich:",
          data
        );

        statusAnzeigen(
          status,
          "Registrierung erfolgreich ✅ Bitte bestätige gegebenenfalls deine E-Mail-Adresse."
        );

        registerForm.reset();

        setTimeout(function () {
          window.location.href =
            "login.html";
        }, 2000);

      } catch (error) {
        console.error(
          "Registrierungsfehler:",
          error
        );

        statusAnzeigen(
          status,
          "Registrierung fehlgeschlagen ❌ " +
          error.message
        );

        buttonSperren(
          submitButton,
          false
        );
      }
    }
  );
}


/* =========================================
   PASSWORTSTÄRKE
========================================= */

const passwordInput =
  document.getElementById("password");

const passwordStrength =
  document.getElementById("passwordStrength");

if (passwordInput && passwordStrength) {
  passwordInput.addEventListener(
    "input",
    function () {
      const password =
        passwordInput.value;

      if (!password) {
        passwordStrength.textContent = "";
        return;
      }

      let score = 0;

      if (password.length >= 6) {
        score++;
      }

      if (password.length >= 10) {
        score++;
      }

      if (/[A-Z]/.test(password)) {
        score++;
      }

      if (/[0-9]/.test(password)) {
        score++;
      }

      if (/[^A-Za-z0-9]/.test(password)) {
        score++;
      }

      if (score <= 2) {
        passwordStrength.textContent =
          "Passwortstärke: schwach";

        passwordStrength.style.color =
          "#ff4d6d";
      } else if (score <= 4) {
        passwordStrength.textContent =
          "Passwortstärke: mittel";

        passwordStrength.style.color =
          "#f5c542";
      } else {
        passwordStrength.textContent =
          "Passwortstärke: stark";

        passwordStrength.style.color =
          "#22c55e";
      }
    }
  );
}


/* =========================================
   ANMELDUNG
========================================= */

const loginForm =
  document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      const loginValue =
        document
          .getElementById("loginEmail")
          .value
          .trim();

      const password =
        document.getElementById(
          "loginPassword"
        ).value;

      const status =
        document.getElementById("status");

      const submitButton =
        loginForm.querySelector(
          'button[type="submit"]'
        );

      if (!loginValue || !password) {
        statusAnzeigen(
          status,
          "Bitte gib deine E-Mail-Adresse und dein Passwort ein ❌"
        );

        return;
      }

      if (!loginValue.includes("@")) {
        statusAnzeigen(
          status,
          "Bitte melde dich mit deiner E-Mail-Adresse an ❌"
        );

        return;
      }

      buttonSperren(
        submitButton,
        true
      );

      statusAnzeigen(
        status,
        "Anmeldung läuft..."
      );

      try {
        const { data, error } =
          await supabaseClient.auth
            .signInWithPassword({
              email: loginValue,
              password: password
            });

        if (error) {
          throw error;
        }

        console.log(
          "Anmeldung erfolgreich:",
          data
        );

        statusAnzeigen(
          status,
          "Anmeldung erfolgreich ✅ Du wirst weitergeleitet..."
        );

        setTimeout(function () {
          window.location.href =
            "upload.html";
        }, 1000);

      } catch (error) {
        console.error(
          "Anmeldefehler:",
          error
        );

        statusAnzeigen(
          status,
          "Anmeldung fehlgeschlagen ❌ E-Mail-Adresse oder Passwort ist falsch."
        );

        buttonSperren(
          submitButton,
          false
        );
      }
    }
  );
}


/* =========================================
   PASSWORT-RESET SENDEN
========================================= */

async function passwortResetSenden() {
  const emailElement =
    document.getElementById("email");

  const status =
    document.getElementById("status");

  const resetForm =
    document.getElementById(
      "forgotPasswortForm"
    ) ||
    document.getElementById(
      "forgotPasswordForm"
    );

  const resetButton = resetForm
    ? resetForm.querySelector("button")
    : null;

  if (!emailElement) {
    return;
  }

  const email =
    emailElement.value.trim();

  if (!email) {
    statusAnzeigen(
      status,
      "Bitte gib deine E-Mail-Adresse ein ❌"
    );

    return;
  }

  buttonSperren(
    resetButton,
    true
  );

  statusAnzeigen(
    status,
    "Reset-Link wird gesendet..."
  );

  try {
    const { error } =
      await supabaseClient.auth
        .resetPasswordForEmail(
          email,
          {
            redirectTo:
              appUrl +
              "/new-password.html"
          }
        );

    if (error) {
      throw error;
    }

    statusAnzeigen(
      status,
      "Reset-Link wurde gesendet ✅ Bitte prüfe dein E-Mail-Postfach."
    );

  } catch (error) {
    console.error(
      "Fehler beim Passwort-Reset:",
      error
    );

    statusAnzeigen(
      status,
      "Fehler beim Senden ❌ " +
      error.message
    );

  } finally {
    buttonSperren(
      resetButton,
      false
    );
  }
}


/* Funktion für onclick im HTML verfügbar machen */

window.passwortResetSenden =
  passwortResetSenden;


/* =========================================
   RESET-FORMULAR MIT ENTER ABSENDEN
========================================= */

const forgotPasswordForm =
  document.getElementById(
    "forgotPasswortForm"
  ) ||
  document.getElementById(
    "forgotPasswordForm"
  );

if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      await passwortResetSenden();
    }
  );
}