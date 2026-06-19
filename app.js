const SUPABASE_URL = "https://ktnalbuhlfrmgkmivubj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TmTgUV4k6o6bR8ik21EiDg_7BvGKYb4";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const form = document.getElementById("uploadForm");
const status = document.getElementById("status");

async function liveTagePruefen() {
  const liveDaySelect = document.getElementById("liveDay");
  if (!liveDaySelect) return;

  const tage = ["Montag", "Mittwoch", "Freitag"];

  for (const tag of tage) {
    const { data, error } = await supabaseClient
      .from("Songs")
      .select("id")
      .eq("live_day", tag);

    if (error) {
      console.error(error);
      continue;
    }

    if (data.length >= 20) {
      const option = [...liveDaySelect.options].find(opt => opt.value === tag);
      if (option) {
        option.disabled = true;
        option.textContent = `${tag} – geschlossen`;
      }
    }
  }
}

liveTagePruefen();

if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "⏳ Song wird hochgeladen...";

    const inputs = form.querySelectorAll("input");
    const textarea = form.querySelector("textarea");

    const kuenstlername = inputs[0].value;
    const einreichername = inputs[1].value;
    const songtitel = inputs[2].value;
    const datei = inputs[3].files[0];

    if (datei) {

    status.innerHTML = `
        🎵 <strong>${datei.name}</strong><br>
        💾 ${(datei.size / 1024 / 1024).toFixed(2)} MB
    `;
}
    const audio = document.createElement("audio");
audio.preload = "metadata";

audio.src = URL.createObjectURL(datei);

await new Promise((resolve, reject) => {
    audio.onloadedmetadata = () => resolve();
    audio.onerror = () => reject();
});

if (audio.duration > 285) {
    status.textContent = "Der Song darf maximal 4 Minuten 45 Sekunden lang sein ❌";
    submitButton.disabled = false;
    submitButton.textContent = "Song einreichen";
    URL.revokeObjectURL(audio.src);
    return;
}
URL.revokeObjectURL(audio.src);

    const genre = document.getElementById("genre").value;
    const live_day = document.getElementById("liveDay").value;
    const spotify_link = document.getElementById("spotifyLink").value;

    if (!live_day) {
      status.textContent = "Bitte wähle einen LIVE-Tag aus ❌";
      submitButton.disabled = false;
      submitButton.textContent = "Song einreichen";
      return;
    }

    const { data: songsAmTag, error: tagError } = await supabaseClient
      .from("Songs")
      .select("id")
      .eq("live_day", live_day);

    if (tagError) {
      console.error(tagError);
      status.textContent = "Fehler bei der Tagesprüfung ❌";
      submitButton.disabled = false;
      submitButton.textContent = "Song einreichen";
      return;
    }

    if (songsAmTag.length >= 20) {
      status.textContent = `Für ${live_day} wurden bereits 20 Songs eingereicht ❌`;
      submitButton.disabled = false;
      submitButton.textContent = "Song einreichen";
      return;
    }

    const { data: vorhandenerSong, error: artistError } = await supabaseClient
      .from("Songs")
      .select("id")
      .ilike("kuenstlername", kuenstlername)
      .eq("live_day", live_day);

    if (artistError) {
      console.error(artistError);
      status.textContent = "Fehler bei der Künstlerprüfung ❌";
      submitButton.disabled = false;
      submitButton.textContent = "Song einreichen";
      return;
    }

    if (vorhandenerSong.length > 0) {
      status.textContent = `Dieser Künstler hat für ${live_day} bereits einen Song eingereicht ❌`;
      submitButton.disabled = false;
      submitButton.textContent = "Song einreichen";
      return;
    }

    if (!datei) {
      status.textContent = "Bitte eine Datei auswählen ❌";
      submitButton.disabled = false;
      submitButton.textContent = "Song einreichen";
      return;
    }

   if (datei.type !== "audio/mpeg") {
    status.textContent = "Nur MP3-Dateien sind erlaubt ❌";
    submitButton.disabled = false;
    submitButton.textContent = "Song einreichen";
    return;
}
const maxDateigroesse = 10 * 1024 * 1024;

if (datei.size > maxDateigroesse) {
    status.textContent = "Die Datei darf maximal 10 MB groß sein ❌";
    submitButton.disabled = false;
    submitButton.textContent = "Song einreichen";
    return;
}

    const filePath = `songs/${Date.now()}-${datei.name}`;

    const { error: uploadError } = await supabaseClient
      .storage
      .from("Songs")
      .upload(filePath, datei);

    if (uploadError) {
      console.error(uploadError);
      status.textContent = "Fehler beim Datei-Upload ❌";
      submitButton.disabled = false;
      submitButton.textContent = "Song einreichen";
      return;
    }

    const { data: urlData } = supabaseClient
      .storage
      .from("Songs")
      .getPublicUrl(filePath);

    const song = {
      kuenstlername,
      einreichename: einreichername,
      songtitel,
      beschreibung: textarea.value,
      genre,
      spotify_link,
      live_day,
      audio_url: urlData.publicUrl,
      status: "Neue Songs"
    };

    const { error } = await supabaseClient
      .from("Songs")
      .insert([song]);

    if (error) {
      console.error(error);
      status.textContent = "Fehler beim Speichern ❌";
      submitButton.disabled = false;
      submitButton.textContent = "Song einreichen";
      return;
    }

    status.innerHTML = "✅ Vielen Dank! Dein Song wurde erfolgreich eingereicht.";
    status.style.color = "#4CAF50";

    form.reset();

    submitButton.disabled = false;
    submitButton.textContent = "Song einreichen";

    setTimeout(() => {
      status.innerHTML = "";
    }, 4000); 
  });
}


 