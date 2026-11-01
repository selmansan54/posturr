# The Posture Reset (Remotion)

15 sahne, 4 dakika (240 sn), 1920x1080, 30 fps. Stilize 3D görünümlü omurga animasyonu, İngilizce altyazı, protokol kutuları ve final uyarısı.

## Kurulum ve çalıştırma (Node.js 18+)

    npm install
    npm start        # canlı önizleme (Remotion Studio)
    npm run build    # out/posture.mp4

## Düzenleme
- `src/scenes.ts`: her sahnenin süresi (`seconds`), seslendirme metni (`vo`), protokol yazısı, renkler, kamera, duruş değerleri
- `src/Figure.tsx`: omurga, kaburga, pelvis, kas çizimleri, etiketler
- `src/Hud.tsx`: HUD, altyazı, zaman çizelgeleri, uyarı

## Seslendirme
Her sahnenin `vo` metnini ElevenLabs vb. araçta "deep male, authoritative" sesle üret, `public/vo/01.mp3 ... 15.mp3` olarak kaydet, `USE_AUDIO = true` yap. Ses süresi sahne süresini aşıyorsa `seconds` değerini artır.

## Not
HUD sayıları gösterim amaçlıdır, klinik ölçüm değildir. Eğitim amaçlıdır, tıbbi tavsiye değildir.
