
    const path = require("path");
    
    // 1. Mock LocalStorage with zombie cache
    const storage = {
      "SMART_RT_WARGA_V1": JSON.stringify([
        { id_warga: "WRG-8368", nama_lengkap: "Warga Zombie 8368" },
        { id_warga: "WRG-001", nama_lengkap: "Bambang Sugianto" }
      ]),
      "SMART_RT_KELUARGA_V1": JSON.stringify([
        { id_kk: "KK-001", no_kk: "3507120101150001" }
      ]),
      "SMART_RT_PEMILIK_V1": JSON.stringify([
        { pemilikRumahId: "OWN-001" }
      ]),
      "SMART_RT_APP_ENV": "production",
      "SMART_RT_AUTH_ACCOUNTS_V1": JSON.stringify({ test: "preserved" })
    };

    global.localStorage = {
      getItem: (k) => storage[k] || null,
      setItem: (k, v) => { storage[k] = v; },
      removeItem: (k) => { delete storage[k]; },
      clear: () => { throw new Error("localStorage.clear() is forbidden!"); }
    };
    global.window = {};

    console.log("Pre-boot cache state:");
    console.log("SMART_RT_WARGA_V1 exists:", Boolean(storage["SMART_RT_WARGA_V1"]));
    console.log("SMART_RT_KELUARGA_V1 exists:", Boolean(storage["SMART_RT_KELUARGA_V1"]));
    console.log("SMART_RT_PEMILIK_V1 exists:", Boolean(storage["SMART_RT_PEMILIK_V1"]));
    console.log("Auth key exists:", Boolean(storage["SMART_RT_AUTH_ACCOUNTS_V1"]));

    const { ResidentFamilyService } = require("./src/services/residentFamilyService.ts");
    const warga = ResidentFamilyService.loadInitialWarga();
    const keluarga = ResidentFamilyService.loadInitialKeluarga();
    const pemilik = ResidentFamilyService.loadInitialPemilik();

    console.log("Post-boot results in production:");
    console.log("warga count:", warga.length);
    console.log("keluarga count:", keluarga.length);
    console.log("pemilik count:", pemilik.length);
    console.log("SMART_RT_WARGA_V1 still in storage:", Boolean(storage["SMART_RT_WARGA_V1"]));
    console.log("SMART_RT_KELUARGA_V1 still in storage:", Boolean(storage["SMART_RT_KELUARGA_V1"]));
    console.log("SMART_RT_PEMILIK_V1 still in storage:", Boolean(storage["SMART_RT_PEMILIK_V1"]));
    console.log("Auth key preserved:", Boolean(storage["SMART_RT_AUTH_ACCOUNTS_V1"]));
  