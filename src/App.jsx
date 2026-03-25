import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function App() {
  const [data, setData] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}kotoba.xlsx`)
      .then((res) => {
        return res.arrayBuffer();
      })
      .then((ab) => {
        const workbook = XLSX.read(ab, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }).map(item => ({
                  kotoba: item.kotoba || item.Kotoba || "",
                  romaji: item.romaji || item.Romaji || "",
                  arti: item.arti || item.Arti || "",
                  keterangan: item.keterangan || item.Keterangan || "",
                  kamus: item.kamus || item.Kamus || "",   // Tambahkan baris ini
                  perubahan: item.perubahan || item.Perubahan || "", // Tambahkan baris ini
                }));

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

  const handleSliderChange = (e) => {
    setIndex(Number(e.target.value));
    setFlipped(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!data || data.length === 0 || !data[index]) {
    return (
      <div className="flex items-center justify-center h-screen">
        Tidak ada data tersedia
      </div>
    );
  }

  const current = data[index] || {};

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      {/* Card */}
      <div
        className="w-[320px] h-[240px] perspective cursor-pointer"
        onClick={() => setFlipped((prev) => !prev)}
      >
        <div
          className={`relative w-full h-full duration-500 preserve-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front Card */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center">
            <div className="absolute top-4 left-4 text-xs text-gray-300">
              {current.kamus || "-"}
            </div>
            <div className="absolute bottom-4 left-4 text-xs text-gray-300">
              {current.perubahan || "-"}
            </div>
            
            <h1 className="text-2xl font-normal text-center">
              {current.kotoba || "-"}
            </h1>
            <p className="text-gray-500 mt-2">
              {current.romaji || "-"}
            </p>
          </div>

          {/* Back Card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-blue-500 text-white rounded-2xl shadow-lg relative">
            <div className="absolute top-4 right-4 text-xs font-normal">
              {current.keterangan || "-"}
            </div>
            
            <div className="flex items-center justify-center h-full">
              <h1 className="text-xl font-semibold text-center">
                {current.arti || "-"}
              </h1>
            </div>
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

      {/* Slider */}
      <div className="mt-6 w-full max-w-md">
        <input
          type="range"
          min="0"
          max={data.length - 1}
          value={index}
          onChange={handleSliderChange}
          className="w-full"
        />
        <div className="text-center text-sm text-gray-600 mt-2">
          Loncat ke: {index + 1}
        </div>
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
