const COMMUNITY_CODE = "ANNI2026";

function pruefeCode() {

    const code = document.getElementById("communityCode").value.trim();

    if (code === COMMUNITY_CODE) {

        localStorage.setItem("communityAccess", "true");

       window.location.href = "register.html";

    } else {

        document.getElementById("meldung").innerHTML =
        "❌ Falscher Community-Code.";

    }

}
