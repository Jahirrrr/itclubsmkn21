const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Ganti dengan query pencarian Anda
  const searchQuery = 'inurl:.profil.php?id= site:id';

  await page.goto(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);

  // Tunggu hingga semua hasil pencarian dimuat (sampai 100)
  let links = [];
  while (links.length < 100) {
    await page.waitForSelector('.tF2Cxc', { timeout: 5000 }); // Tunggu hingga elemen .tF2Cxc muncul
    const newLinks = await page.evaluate(() => {
      const linkElements = document.querySelectorAll('.tF2Cxc a');
      const linkList = Array.from(linkElements);
      return linkList.map(link => link.href);
    });

    // Hapus duplikat dan gabungkan dengan hasil sebelumnya
    links = Array.from(new Set([...links, ...newLinks]));

    // Gulir ke bawah untuk memuat lebih banyak hasil
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  // Ambil 100 link pertama dari hasil pencarian
  links = links.slice(0, 100);

  // Simpan link ke dalam file teks
  fs.writeFileSync('hasil_pencarian.txt', links.join('\n'));

  await browser.close();
})();
