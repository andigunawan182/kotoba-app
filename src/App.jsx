import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load Excel filer

  useEffect(() => {
    fetch("/kotoba-app/public/kotoba.xlsx")
      .then((res) => {
        if (!res.ok) throw new Error("File Excel tidak ditemukan");
        return res.arrayBuffer();
      })
      .then((ab) => {
        const workbook = XLSX.read(ab, { type: "array" });
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) throw new Error("Sheet tidak ditemukan di file Excel");

        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        if (!json || json.length === 0) {
          throw new Error("Data Excel kosong atau format salah");
        }

        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const nextCard = () => {
    if (index < data.length - 1) {
      setIndex((prev) => prev + 1);
      setFlipped(false);
    }
  };

  const prevCard = () => {
    if (index > 0) {
      setIndex((prev) => prev - 1);
      setFlipped(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  // Safety check (fix error undefined[0])
  if (!data || data.length === 0 || !data[index]) {
    return (
      <div className="flex items-center justify-center h-screen">
        Tidak ada data tersedia
      </div>
    );
  }

  const current = data[index] || {};

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Card */}
      <div
        className="w-80 h-52 perspective cursor-pointer"
        onClick={() => setFlipped((prev) => !prev)}
      >
        <div
          className={`relative w-full h-full duration-500 preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">
              {current.kotoba || "-"}
            </h1>
            <p className="text-gray-500 mt-2">
              {current.romaji || "-"}
            </p>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-500 text-white rounded-2xl shadow-lg flex items-center justify-center">
            <h1 className="text-xl font-semibold">
              {current.arti || "-"}
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={prevCard}
          disabled={index === 0}
          className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Kembali
        </button>
        <button
          onClick={nextCard}
          disabled={index === data.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Selanjutnya
        </button>
      </div>

      {/* Progress */}
      <p className="mt-4 text-gray-600">
        {index + 1} / {data.length}
      </p>

      <style>{`
        .perspective {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
