import React, { useState, useEffect } from "react";
import { format, differenceInDays, isBefore, isAfter } from "date-fns";
import { Pencil, Trash2, MoonStar, SunMedium, PlusCircle, RotateCcw } from "lucide-react";

export default function AirbnbApp() {
  const [gesamtKosten, setGesamtKosten] = useState("");
  const [startDatum, setStartDatum] = useState("");
  const [endDatum, setEndDatum] = useState("");
  const [personen, setPersonen] = useState([]);
  const [suchbegriff, setSuchbegriff] = useState("");
  const [dialogOffen, setDialogOffen] = useState(false);
  const [bearbeiteIndex, setBearbeiteIndex] = useState(null);
  const [name, setName] = useState("");
  const [anreise, setAnreise] = useState("");
  const [abreise, setAbreise] = useState("");
  const [warnung, setWarnung] = useState("");
  const [darkmode, setDarkmode] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setDarkmode(true);
    }
  }, []);

  const toggleTheme = () => setDarkmode(!darkmode);

  const resetForm = () => {
    setName("");
    setAnreise("");
    setAbreise("");
    setWarnung("");
  };

  const handleHinzufuegen = () => {
    resetForm();
    setBearbeiteIndex(null);
    setDialogOffen(true);
  };

  const handleSpeichern = () => {
    if (!name || !anreise || !abreise) return;
    if (isBefore(new Date(anreise), new Date(startDatum)) || isAfter(new Date(abreise), new Date(endDatum))) {
      setWarnung("⚠️ Datum liegt außerhalb des Buchungszeitraums!");
      return;
    }

    const neuePerson = { name, anreise, abreise };
    const neueListe = [...personen];
    if (bearbeiteIndex !== null) neueListe[bearbeiteIndex] = neuePerson;
    else neueListe.push(neuePerson);
    setPersonen(neueListe);
    setDialogOffen(false);
  };

  const handleBearbeiten = (index) => {
    const p = personen[index];
    setName(p.name);
    setAnreise(p.anreise);
    setAbreise(p.abreise);
    setBearbeiteIndex(index);
    setDialogOffen(true);
    setWarnung("");
  };

  const handleLoeschen = (index) => {
    const neueListe = personen.filter((_, i) => i !== index);
    setPersonen(neueListe);
  };

  const tage = differenceInDays(new Date(endDatum), new Date(startDatum));

  const kostenDaten = personen.map((p) => ({ ...p, naechte: 0, kosten: 0 }));
  if (tage > 0 && parseFloat(gesamtKosten)) {
    const start = new Date(startDatum);
    const kostenProTag = parseFloat(gesamtKosten) / tage;

    for (let i = 0; i < tage; i++) {
      const aktuellerTag = new Date(start);
      aktuellerTag.setDate(aktuellerTag.getDate() + i);
      const anwesende = [];

      personen.forEach((p, index) => {
        const von = new Date(p.anreise);
        const bis = new Date(p.abreise);
        if (aktuellerTag >= von && aktuellerTag < bis) {
          anwesende.push(index);
        }
      });

      if (anwesende.length > 0) {
        const anteil = kostenProTag / anwesende.length;
        anwesende.forEach((i) => {
          kostenDaten[i].kosten += anteil;
          kostenDaten[i].naechte += 1;
        });
      }
    }

    kostenDaten.forEach((p) => {
      p.kosten = Math.round(p.kosten);
    });
  }

  const gefilterteDaten = kostenDaten.filter((p) =>
    p.name.toLowerCase().includes(suchbegriff.toLowerCase())
  );

  return (
    <div className={darkmode ? "dark bg-gray-950 text-white min-h-screen" : "bg-zinc-100 text-gray-900 min-h-screen"}>
      <div className="container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Airbnb Kostenaufteilung</h1>
          <button onClick={toggleTheme} className="p-2 rounded-full transition duration-200 hover:bg-gray-200 dark:hover:bg-gray-700">
            {darkmode ? <SunMedium size={20} /> : <MoonStar size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <input
            type="number"
            placeholder="Betrag eingeben"
            className="p-3 rounded-lg bg-zinc-100 dark:bg-gray-800 placeholder-gray-400 border border-gray-300 dark:border-gray-700 shadow-sm"
            value={gesamtKosten}
            onChange={(e) => setGesamtKosten(e.target.value.replace(/^0+/, ""))}
          />
          <input
            type="date"
            className="p-3 rounded-lg bg-zinc-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm"
            value={startDatum}
            onChange={(e) => setStartDatum(e.target.value)}
          />
          <input
            type="date"
            className="p-3 rounded-lg bg-zinc-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow-sm"
            value={endDatum}
            onChange={(e) => setEndDatum(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Suche nach Name"
            value={suchbegriff}
            onChange={(e) => setSuchbegriff(e.target.value)}
            className="w-full md:w-1/2 p-3 rounded-lg bg-zinc-100 dark:bg-gray-800 placeholder-gray-400 border border-gray-300 dark:border-gray-700 shadow-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={handleHinzufuegen}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <PlusCircle size={18} /> Person hinzufügen
            </button>
            <button
              onClick={resetForm}
              className="bg-yellow-400 text-black px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-yellow-500 transition"
            >
              <RotateCcw size={18} /> Zurücksetzen
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow">
            <thead className="bg-zinc-200 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Anreise</th>
                <th className="p-3 text-left">Abreise</th>
                <th className="p-3 text-center">Nächte</th>
                <th className="p-3 text-right">Kosten (€)</th>
                <th className="p-3 text-center">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {gefilterteDaten.map((p, i) => (
                <tr key={i} className="even:bg-zinc-50 dark:even:bg-gray-900">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{format(new Date(p.anreise), "dd.MM.yyyy")}</td>
                  <td className="p-3">{format(new Date(p.abreise), "dd.MM.yyyy")}</td>
                  <td className="p-3 text-center">{p.naechte}</td>
                  <td className="p-3 text-right">{p.kosten}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleBearbeiten(i)} className="text-blue-500 hover:text-blue-700">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleLoeschen(i)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {gefilterteDaten.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-400">
                    Keine Einträge gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {dialogOffen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-zinc-100 dark:bg-gray-900 p-6 rounded-lg shadow-xl w-full max-w-md relative">
              <h2 className="text-xl font-semibold mb-4">
                {bearbeiteIndex !== null ? "Person bearbeiten" : "Neue Person hinzufügen"}
              </h2>
              <input
                type="text"
                placeholder="Name"
                className="mb-3 w-full p-3 rounded bg-zinc-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="date"
                className="mb-3 w-full p-3 rounded bg-zinc-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                value={anreise}
                onChange={(e) => setAnreise(e.target.value)}
              />
              <input
                type="date"
                className="mb-3 w-full p-3 rounded bg-zinc-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
                value={abreise}
                onChange={(e) => setAbreise(e.target.value)}
              />
              {warnung && <p className="text-red-500 mb-2">{warnung}</p>}
              <div className="flex justify-between gap-3">
                <button onClick={resetForm} className="text-gray-500 flex items-center gap-1">
                  <RotateCcw size={16} /> Zurücksetzen
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setDialogOffen(false)} className="text-gray-500">
                    Abbrechen
                  </button>
                  <button onClick={handleSpeichern} className="bg-indigo-600 text-white px-4 py-2 rounded">
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
