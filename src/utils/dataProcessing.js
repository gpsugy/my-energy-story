import Papa from 'papaparse';

export const parseCSV = (input) => {
  return new Promise((resolve, reject) => {
    Papa.parse(input, {
      header: true,
      dynamicTyping: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
};

export const loadDefaultData = async () => {
  const res = await fetch('/low-winter-interval-data.csv');
  const fileText = await res.text();
  return parseCSV(fileText);
};
