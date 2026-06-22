const COMMUNITY_CODE = "ANNI2026";

function pruefeCode() {
  const eingabe = document.getElementById("communityCode");
  const meldung = document.getElementById("meldung");

  if (!eingabe || !meldung) {
    console.error("Community-Felder wurden nicht gefunden.");
    return;
  }

  const code = eingabe.value.trim();

  if (code === "") {
    meldung.textContent = "Bitte gib deinen Community-Code ein ❌";
    meldung.style.color = "#ff4d6d";
    return;
  }

  if (code === COMMUNITY_CODE) {
    localStorage.setItem("communityAccess", "true");

    meldung.textContent = "Zugang freigeschaltet ✅";
    meldung.style.color = "#4CAF50";

    window.location.href = "./register.html";
    return;
  }

  meldung.textContent = "Falscher Community-Code ❌";
  meldung.style.color = "#ff4d6d";

  eingabe.value = "";
  eingabe.focus();
}

window.pruefeCode = pruefeCode;