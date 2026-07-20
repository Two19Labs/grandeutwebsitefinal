const sharp = require('sharp');

const SUPABASE_URL = 'https://mtycgxndnaxdusqsvqqs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eWNneG5kbmF4ZHVzcXN2cXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0NDU1MDgsImV4cCI6MjEwMDAyMTUwOH0._9CsDcumHsowYMTmzTh-SMcSM9ZexoB7dFhgBsCrNxs';

const HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
};

async function optimizePhotos() {
    console.log("⚡ Starting Supabase Team Member Photo Optimization...");
    
    // 1. Fetch all members
    const res = await fetch(`${SUPABASE_URL}/rest/v1/team_members?select=id,name,role,photo`, {
        headers: HEADERS
    });
    if (!res.ok) {
        console.error("Failed to fetch team members:", await res.text());
        return;
    }

    const members = await res.json();
    console.log(`Found ${members.length} members in Supabase database.\n`);

    let totalOldBytes = 0;
    let totalNewBytes = 0;
    let updatedCount = 0;

    for (const member of members) {
        const photo = member.photo;
        if (!photo || typeof photo !== 'string' || !photo.includes('base64,')) {
            console.log(`[SKIP] ID ${member.id} (${member.name}): No valid base64 photo`);
            continue;
        }

        const oldLen = photo.length;
        totalOldBytes += oldLen;

        try {
            // Extract base64 buffer
            const base64Data = photo.split('base64,')[1];
            const inputBuffer = Buffer.from(base64Data, 'base64');

            // Resize to max 400x400 and compress to JPEG quality 70
            const compressedBuffer = await sharp(inputBuffer)
                .resize({ width: 400, height: 400, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 70, progressive: true })
                .toBuffer();

            const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
            const newLen = compressedBase64.length;
            totalNewBytes += newLen;

            const savedKB = ((oldLen - newLen) / 1024).toFixed(1);
            const ratio = ((1 - (newLen / oldLen)) * 100).toFixed(1);

            // Update row in Supabase
            const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/team_members?id=eq.${member.id}`, {
                method: 'PATCH',
                headers: HEADERS,
                body: JSON.stringify({ photo: compressedBase64 })
            });

            if (updateRes.ok) {
                updatedCount++;
                console.log(`[OK] ID ${member.id} (${member.name}): ${(oldLen/1024).toFixed(1)}KB -> ${(newLen/1024).toFixed(1)}KB (Saved ${savedKB}KB / -${ratio}%)`);
            } else {
                console.error(`[ERROR] ID ${member.id} (${member.name}): Update failed ${updateRes.status}`);
            }

        } catch (err) {
            console.error(`[ERROR] ID ${member.id} (${member.name}): Compression error`, err.message);
        }
    }

    console.log("\n==================================================");
    console.log(`SUMMARY:`);
    console.log(`Updated Members: ${updatedCount} / ${members.length}`);
    console.log(`Total Original Photo Payload: ${(totalOldBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total Optimized Photo Payload: ${(totalNewBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Total Storage & Egress Saved: ${((totalOldBytes - totalNewBytes) / 1024 / 1024).toFixed(2)} MB (${((1 - totalNewBytes/totalOldBytes)*100).toFixed(1)}% reduction!)`);
    console.log("==================================================\n");
}

optimizePhotos();
