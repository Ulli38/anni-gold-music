
const supabaseUrl = "https://ktnalbuhlfrmgkmivubj.supabase.co";
const supabaseKey = "sb_publishable_TmTgUV4k6o6bR8ik21EiDg_7BvGKYb4";


const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const artistName = document.getElementById("artistName").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const status = document.getElementById("status");

        status.textContent = "Registrierung wird gesendet...";

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    artist_name: artistName,
                    username: username
                },
                emailRedirectTo: "https://anni-gold-music.netlify.app/login.html"
            }
        });

        if (error) {
            console.error(error);
            status.textContent = "Registrierung fehlgeschlagen ❌ " + error.message;
            return;
        }

        status.textContent = "Registrierung erfolgreich ✅ Du wirst zur Anmeldung weitergeleitet...";

setTimeout(() => {
    window.location.href = "login.html";
}, 1500);

});
}
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const status = document.getElementById("status");

        status.textContent = "Anmeldung läuft...";

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error(error);
            status.textContent = "Anmeldung fehlgeschlagen ❌ " + error.message;
            return;
        }

        status.textContent = "Anmeldung erfolgreich ✅ Du wirst weitergeleitet...";

        setTimeout(() => {
            window.location.href = "upload.html";
        }, 1000);
    });
}
const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {
   
    forgotPasswordForm.addEventListener("submit", async function (event) {
    alert("Reset-Button wurde geklickt");
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const status = document.getElementById("status");

        status.textContent = "Reset-Link wird gesendet...";

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
           redirectTo: "https://ulli38.github.io/anni-gold-music/reset.html"
        });

        if (error) {
            console.error(error);
            status.textContent = "Fehler beim Senden ❌ " + error.message;
            return;
        }

        status.textContent = "Reset-Link wurde gesendet ✅ Bitte prüfe dein E-Mail-Postfach.";
    });
}
async function passwortResetSenden() {
    

    const email = document.getElementById("email").value.trim();
    const status = document.getElementById("status");

    if (!email) {
        status.textContent = "Bitte gib deine E-Mail-Adresse ein ❌";
        return;
    }

    status.textContent = "Reset-Link wird gesendet...";

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: "https://anni-gold-music.netlify.app/login.html"
    });

    if (error) {
        console.error(error);
        status.textContent = "Fehler beim Senden ❌ " + error.message;
        return;
    }

    status.textContent = "Reset-Link wurde gesendet ✅ Bitte prüfe dein E-Mail-Postfach.";
}