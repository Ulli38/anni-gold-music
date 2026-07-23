const SUPABASE_URL =
  "https://ktnalbuhlfrmgkmivubj.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_TmTgUV4k6o6bR8ik21EiDg_7BvGKYb4";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const LIVE_TAGE = [
  "Montag",
  "Mittwoch",
  "Freitag"
];

const AKTIVE_STATUS = [
  "Neue Songs",
  "Heute im LIVE"
];

const MAX_SONGS_PRO_TAG = 20;
const LIVE_START_STUNDE = 20;
const BERLIN_ZEITZONE = "Europe/Berlin";
const MAX_DATEIGROESSE = 10 * 1024 * 1024;
const MAX_SONGDAUER = 285;

const form = document.getElementById("uploadForm");
const statusElement = document.getElementById("status");

if (form) {
  const submitButton = form.querySelector(
    'button[type="submit"]'
  );

  const kuenstlernameInput =
    document.getElementById("kuenstlername");

  const einreichernameInput =
    document.getElementById("einreichername");

  const songtitelInput =
    document.getElementById("songtitel");

  const beschreibungInput =
    document.getElementById("beschreibung");

  const genreSelect =
    document.getElementById("genre");

  const liveDaySelect =
    document.getElementById("liveDay");

  const songDateiInput =
    document.getElementById("songDatei");

  const spotifyLinkInput =
    document.getElementById("spotifyLink");


  function statusAnzeigen(text, typ = "info") {
    if (!statusElement) {
      return;
    }

    statusElement.textContent = text;

    if (typ === "erfolg") {
      statusElement.style.color = "#4CAF50";
    } else if (typ === "fehler") {
      statusElement.style.color = "#ff4d6d";
    } else {
      statusElement.style.color = "#d4af37";
    }
  }


  function uploadStatusSetzen(laeuft) {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = laeuft;

    if (laeuft) {
      submitButton.textContent =
        "⏳ Song wird hochgeladen...";

      submitButton.style.opacity = "0.65";
      submitButton.style.cursor = "not-allowed";
    } else {
      submitButton.textContent =
        "Song einreichen";

      submitButton.style.opacity = "1";
      submitButton.style.cursor = "pointer";
    }
  }


  function dateinameBereinigen(dateiname) {
    const nameOhneEndung = dateiname
      .replace(/\.[^/.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80);

    const sichererName =
      nameOhneEndung || "song";

    return sichererName + ".mp3";
  }


  function eindeutigenDateipfadErstellen(datei) {
    const zufallswert =
      window.crypto &&
      typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : Math.random()
            .toString(36)
            .slice(2);

    const sichererDateiname =
      dateinameBereinigen(datei.name);

    return (
      "songs/" +
      Date.now() +
      "-" +
      zufallswert +
      "-" +
      sichererDateiname
    );
  }


  function istMp3Datei(datei) {
    if (!datei) {
      return false;
    }

    const dateinameIstMp3 =
      datei.name
        .toLowerCase()
        .endsWith(".mp3");

    const dateitypIstMp3 =
      datei.type === "audio/mpeg" ||
      datei.type === "audio/mp3" ||
      datei.type === "";

    return dateinameIstMp3 && dateitypIstMp3;
  }


  function audioDauerErmitteln(datei) {
    return new Promise(function (
      resolve,
      reject
    ) {
      const audio =
        document.createElement("audio");

      const objectUrl =
        URL.createObjectURL(datei);

      let timeout;

      function aufraeumen() {
        clearTimeout(timeout);

        audio.onloadedmetadata = null;
        audio.onerror = null;

        URL.revokeObjectURL(objectUrl);
      }

      audio.preload = "metadata";
      audio.src = objectUrl;

      audio.onloadedmetadata = function () {
        const dauer = audio.duration;

        aufraeumen();

        if (!Number.isFinite(dauer)) {
          reject(
            new Error(
              "Die Songlänge konnte nicht gelesen werden."
            )
          );

          return;
        }

        resolve(dauer);
      };

      audio.onerror = function () {
        aufraeumen();

        reject(
          new Error(
            "Die MP3-Datei konnte nicht gelesen werden."
          )
        );
      };

      timeout = setTimeout(function () {
        aufraeumen();

        reject(
          new Error(
            "Die Prüfung der MP3-Datei dauert zu lange."
          )
        );
      }, 15000);
    });
  }


  async function aktiveSongsLaden() {
    const { data, error } =
      await supabaseClient
        .from("Songs")
        .select(
        "id, kuenstlername, live_day, status, created_at" 
        )
        .in("status", AKTIVE_STATUS);

    if (error) {
      throw error;
    }

    return data || [];
  }

function berlinDatumsteile(datum = new Date()) {
  const teile = new Intl.DateTimeFormat(
    "de-DE",
    {
      timeZone: BERLIN_ZEITZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }
  ).formatToParts(datum);

  const werte = {};

  teile.forEach(function (teil) {
    if (teil.type !== "literal") {
      werte[teil.type] = teil.value;
    }
  });

  const wochentage = {
    Sonntag: 0,
    Montag: 1,
    Dienstag: 2,
    Mittwoch: 3,
    Donnerstag: 4,
    Freitag: 5,
    Samstag: 6
  };

  return {
    jahr: Number(werte.year),
    monat: Number(werte.month),
    tag: Number(werte.day),
    wochentag: wochentage[werte.weekday],
    stunde: Number(werte.hour),
    minute: Number(werte.minute)
  };
}


function wochenStartSchluessel(datum = new Date()) {
  const echtesDatum =
    datum instanceof Date
      ? datum
      : new Date(datum);

  if (Number.isNaN(echtesDatum.getTime())) {
    return null;
  }

  const teile = berlinDatumsteile(echtesDatum);

  if (
    !Number.isFinite(teile.jahr) ||
    !Number.isFinite(teile.monat) ||
    !Number.isFinite(teile.tag) ||
    !Number.isFinite(teile.wochentag)
  ) {
    return null;
  }

  const datumUtc = new Date(
    Date.UTC(
      teile.jahr,
      teile.monat - 1,
      teile.tag
    )
  );

  const tageSeitMontag =
    (teile.wochentag + 6) % 7;

  datumUtc.setUTCDate(
    datumUtc.getUTCDate() - tageSeitMontag
  );

  return datumUtc
    .toISOString()
    .slice(0, 10);
}


function istLiveTagZeitlichGeschlossen(
  liveTag,
  aktiveSongs,
  jetzt = new Date()
) {
  const jetztTeile =
    berlinDatumsteile(jetzt);

  if (jetztTeile.wochentag === 0) {
    return aktiveSongs.length > 0;
  }

  const aktuelleWoche =
    wochenStartSchluessel(jetzt);

  const alteWocheNochVorhanden =
    aktiveSongs.some(function (song) {
      if (!song.created_at) {
        return false;
      }

      const songWoche =
        wochenStartSchluessel(
          song.created_at
        );

      return (
        songWoche !== null &&
        aktuelleWoche !== null &&
        songWoche < aktuelleWoche
      );
    });

  if (alteWocheNochVorhanden) {
    console.log("Aktuelle Woche:", aktuelleWoche);

aktiveSongs.forEach(function (song) {
  console.log({
    kuenstler: song.kuenstlername,
    created_at: song.created_at,
    songWoche: wochenStartSchluessel(song.created_at)
  });
});
    return true;
  }

  const liveWochentage = {
    Montag: 1,
    Mittwoch: 3,
    Freitag: 5
  };

  const liveWochentag =
    liveWochentage[liveTag];

  if (
    jetztTeile.wochentag >
    liveWochentag
  ) {
    return true;
  }

  if (
    jetztTeile.wochentag <
    liveWochentag
  ) {
    return false;
  }

  return (
    jetztTeile.stunde >=
    LIVE_START_STUNDE
  );
}
  async function liveTagePruefen() {
    if (!liveDaySelect) {
      return;
    }

    LIVE_TAGE.forEach(function (tag) {
      const option =
        Array.from(
          liveDaySelect.options
        ).find(function (eintrag) {
          return eintrag.value === tag;
        });

      if (option) {
        option.disabled = false;
        option.textContent = tag;
      }
    });

    try {
      const aktiveSongs =
        await aktiveSongsLaden();

      LIVE_TAGE.forEach(function (tag) {
        const anzahl = aktiveSongs.filter(
          function (song) {
            return song.live_day === tag;
          }
        ).length;

       const zeitlichGeschlossen =
  istLiveTagZeitlichGeschlossen(
    tag,
    aktiveSongs
  );

if (
  anzahl >= MAX_SONGS_PRO_TAG ||
  zeitlichGeschlossen
) {
  const option =
    Array.from(
      liveDaySelect.options
    ).find(function (eintrag) {
      return eintrag.value === tag;
    });

  if (option) {
    option.disabled = true;
    option.textContent =
      tag + " – 🔒 geschlossen";

    if (liveDaySelect.value === tag) {
      liveDaySelect.value = "";

      statusAnzeigen(
        "🔒 Der Live-Tag ist geschlossen. Neue Songwünsche sind erst nach der Sonntagslöschung wieder möglich.",
        "fehler"
      );
    }
  }
}
      });

    } catch (error) {
      console.error(
        "Fehler bei der LIVE-Tag-Prüfung:",
        error
      );
    }
  }


  if (songDateiInput) {
    songDateiInput.addEventListener(
      "change",
      function () {
        const datei =
          songDateiInput.files[0];

        if (!datei) {
          statusAnzeigen("");
          return;
        }

        const groesseInMB =
          (
            datei.size /
            1024 /
            1024
          ).toFixed(2);

        statusAnzeigen(
          "🎵 " +
          datei.name +
          " · 💾 " +
          groesseInMB +
          " MB"
        );
      }
    );
  }


  form.addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      const kuenstlername =
        kuenstlernameInput
          ? kuenstlernameInput.value.trim()
          : "";

      const einreichername =
        einreichernameInput
          ? einreichernameInput.value.trim()
          : "";

      const songtitel =
        songtitelInput
          ? songtitelInput.value.trim()
          : "";

      const beschreibung =
        beschreibungInput
          ? beschreibungInput.value.trim()
          : "";

      const genre =
        genreSelect
          ? genreSelect.value
          : "";

      const liveDay =
        liveDaySelect
          ? liveDaySelect.value
          : "";

      const spotifyLink =
        spotifyLinkInput
          ? spotifyLinkInput.value.trim()
          : "";

      const datei =
        songDateiInput &&
        songDateiInput.files
          ? songDateiInput.files[0]
          : null;


      if (
        !kuenstlername ||
        !einreichername ||
        !songtitel ||
        !beschreibung ||
        !genre ||
        !liveDay
      ) {
        statusAnzeigen(
          "Bitte fülle alle Pflichtfelder aus ❌",
          "fehler"
        );

        return;
      }


      if (!datei) {
        statusAnzeigen(
          "Bitte wähle eine MP3-Datei aus ❌",
          "fehler"
        );

        return;
      }


      if (!istMp3Datei(datei)) {
        statusAnzeigen(
          "Nur MP3-Dateien sind erlaubt ❌",
          "fehler"
        );

        return;
      }


      if (datei.size > MAX_DATEIGROESSE) {
        statusAnzeigen(
          "Die Datei darf maximal 10 MB groß sein ❌",
          "fehler"
        );

        return;
      }


      uploadStatusSetzen(true);

      let filePath = "";
      let dateiHochgeladen = false;

      try {
        statusAnzeigen(
          "Songlänge wird geprüft..."
        );

        const songDauer =
          await audioDauerErmitteln(datei);

        if (songDauer > MAX_SONGDAUER) {
          throw new Error(
            "Der Song darf maximal 4 Minuten 45 Sekunden lang sein ❌"
          );
        }


        statusAnzeigen(
          "LIVE-Tag wird geprüft..."
        );

        const aktiveSongs =
          await aktiveSongsLaden();

        const songsAmTag =
          aktiveSongs.filter(
            function (song) {
              return song.live_day === liveDay;
            }
          );
          if (
  istLiveTagZeitlichGeschlossen(
    liveDay,
    aktiveSongs
  )
) {
  throw new Error(
    "🔒 Der Live-Tag " +
    liveDay +
    " ist geschlossen. Neue Songwünsche sind erst nach der Sonntagslöschung wieder möglich."
  );
}
        if (
          songsAmTag.length >=
          MAX_SONGS_PRO_TAG
        ) {
          throw new Error(
            "Für " +
            liveDay +
            " wurden bereits 20 Songs eingereicht ❌"
          );
        }


        const normalisierterKuenstler =
          kuenstlername.toLocaleLowerCase(
            "de-DE"
          );

        const kuenstlerBereitsVorhanden =
          songsAmTag.some(
            function (song) {
              return (
                song.kuenstlername || ""
              )
                .trim()
                .toLocaleLowerCase(
                  "de-DE"
                ) ===
                normalisierterKuenstler;
            }
          );

        if (kuenstlerBereitsVorhanden) {
          throw new Error(
            "Dieser Künstler hat für " +
            liveDay +
            " bereits einen Song eingereicht ❌"
          );
        }


        statusAnzeigen(
          "MP3-Datei wird hochgeladen..."
        );

        filePath =
          eindeutigenDateipfadErstellen(
            datei
          );

        const {
          error: uploadError
        } = await supabaseClient
          .storage
          .from("Songs")
          .upload(
            filePath,
            datei,
            {
              contentType: "audio/mpeg",
              upsert: false
            }
          );

        if (uploadError) {
          throw new Error(
            "Fehler beim Datei-Upload ❌ " +
            uploadError.message
          );
        }

        dateiHochgeladen = true;


        const { data: urlData } =
          supabaseClient
            .storage
            .from("Songs")
            .getPublicUrl(filePath);

        const publicUrl =
          urlData &&
          urlData.publicUrl
            ? urlData.publicUrl
            : "";

        if (!publicUrl) {
          throw new Error(
            "Die Datei-URL konnte nicht erstellt werden ❌"
          );
        }


        statusAnzeigen(
          "Songdaten werden gespeichert..."
        );

        const song = {
          kuenstlername:
            kuenstlername,

          einreichename:
            einreichername,

          songtitel:
            songtitel,

          beschreibung:
            beschreibung,

          genre:
            genre,

          spotify_link:
            spotifyLink || null,

          live_day:
            liveDay,

          audio_url:
            publicUrl,

          status:
            "Neue Songs"
        };

        const {
          error: speichernError
        } = await supabaseClient
          .from("Songs")
          .insert([song]);

        if (speichernError) {
          throw new Error(
            "Fehler beim Speichern ❌ " +
            speichernError.message
          );
        }


        statusAnzeigen(
          "✅ Vielen Dank! Dein Song wurde erfolgreich eingereicht.",
          "erfolg"
        );

        form.reset();

        await liveTagePruefen();

        setTimeout(function () {
          statusAnzeigen("");
        }, 5000);

      } catch (error) {
        console.error(
          "Fehler bei der Song-Einreichung:",
          error
        );


        if (
          dateiHochgeladen &&
          filePath
        ) {
          const {
            error: loeschFehler
          } = await supabaseClient
            .storage
            .from("Songs")
            .remove([filePath]);

          if (loeschFehler) {
            console.error(
              "Datei konnte nicht entfernt werden:",
              loeschFehler
            );
          }
        }

        statusAnzeigen(
          error.message ||
          "Beim Hochladen ist ein Fehler aufgetreten ❌",
          "fehler"
        );

      } finally {
        uploadStatusSetzen(false);
      }
    }
  );


  liveTagePruefen();

setInterval(function () {
  liveTagePruefen();
}, 60 * 1000);
}

