export interface ProvinceData {
  cities: {
    [cityName: string]: string[];
  };
}

export const LOCATION_PRESETS: { [provinceName: string]: ProvinceData } = {
  "Metro Manila": {
    cities: {
      "Manila": ["Malate", "Ermita", "Sampaloc", "Intramuros", "Tondo", "Paco", "San Andres"],
      "Quezon City": ["Diliman", "Cubao", "Commonwealth", "Katipunan", "Loyola Heights", "New Manila", "Batasan Hills"],
      "Makati": ["Bel-Air", "Poblacion", "Guadalupe Nuevo", "Bangkal", "San Lorenzo", "Pio del Pilar", "Tejeros"],
      "Pasig": ["Ortigas Center", "Kapitolyo", "San Antonio", "Ugong", "Caniogan", "Maybunga", "Rosario"],
      "Taguig": ["BGC / Fort Bonifacio", "Ususan", "Wawa", "Pinagsama", "Hagonoy", "Tuktukan"]
    }
  },
  "Cebu": {
    cities: {
      "Cebu City": ["Lahug", "Mabolo", "Banilad", "Guadalupe", "Talamban", "Capitol Site", "Apas", "Labangon", "Tisa", "Sambag I", "Sambag II"],
      "Mandaue City": ["Bakilid", "Banilad", "Centro", "Subangdaku", "Tipolo", "Cabancalan", "Alang-alang", "Guizo", "Looc"],
      "Lapu-Lapu City": ["Basak", "Babag", "Mactan", "Gun-ob", "Marigondon", "Pajo", "Pusok", "Agus", "Bankal"],
      "Talisay City": ["Bulacao", "Dumlog", "Jaclupan", "Linao", "Tabunok", "Pooc", "San Roque", "Cansojong"]
    }
  },
  "Davao": {
    cities: {
      "Davao City": ["Buhangin", "Talomo", "Agdao", "Toril", "Poblacion", "Calinan", "Bunawan", "Matina Crossing"]
    }
  }
};

export interface PSGCLocation {
  code: string;
  name: string;
}

export const fetchProvinces = async (): Promise<PSGCLocation[]> => {
  try {
    const res = await fetch('https://psgc.gitlab.io/api/provinces.json');
    if (!res.ok) throw new Error('Failed to fetch provinces');
    const data = await res.json();
    const list = data.map((item: any) => ({
      code: item.code,
      name: item.name
    }));
    // Sort alphabetically
    list.sort((a: any, b: any) => a.name.localeCompare(b.name));
    // Prepend Metro Manila (NCR)
    return [{ code: '130000000', name: 'Metro Manila' }, ...list];
  } catch (err) {
    console.error(err);
    return [{ code: '130000000', name: 'Metro Manila' }];
  }
};

export const fetchCities = async (provinceCode: string): Promise<PSGCLocation[]> => {
  try {
    let url = '';
    if (provinceCode === '130000000') {
      url = 'https://psgc.gitlab.io/api/regions/130000000/cities-municipalities.json';
    } else {
      url = `https://psgc.gitlab.io/api/provinces/${provinceCode}/cities-municipalities.json`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch cities');
    const data = await res.json();
    const list = data.map((item: any) => ({
      code: item.code,
      name: item.name
    }));
    list.sort((a: any, b: any) => a.name.localeCompare(b.name));
    return list;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchBarangays = async (cityCode: string): Promise<string[]> => {
  try {
    const res = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityCode}/barangays.json`);
    if (!res.ok) throw new Error('Failed to fetch barangays');
    const data = await res.json();
    const list = data.map((item: any) => item.name);
    list.sort();
    return list;
  } catch (err) {
    console.error(err);
    return [];
  }
};
