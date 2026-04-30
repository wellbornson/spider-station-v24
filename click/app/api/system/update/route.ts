import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';
import AdmZip from 'adm-zip';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save zip to a temp location
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }
    
    const zipPath = path.join(tempDir, 'update.zip');
    await writeFile(zipPath, buffer);

    // Extract using AdmZip
    const zip = new AdmZip(zipPath);
    const zipEntries = zip.getEntries();
    
    const rootDir = process.cwd();

    // Iterate through entries and extract manually to handle exclusion logic
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      
      const fileName = entry.entryName;
      
      // CRITICAL SAFETY: Skip db.json and .env files
      if (fileName.toLowerCase().includes('db.json') || 
          fileName.toLowerCase().includes('.env')) {
        console.log(`[Update] Skipping protected file: ${fileName}`);
        continue;
      }

      // Calculate target path
      // Note: AdmZip entryName might have subfolders
      const targetPath = path.join(rootDir, fileName);
      const targetDir = path.dirname(targetPath);

      // Ensure target directory exists
      if (!fs.existsSync(targetDir)) {
        await mkdir(targetDir, { recursive: true });
      }

      // Extract file
      fs.writeFileSync(targetPath, entry.getData());
    }

    // Cleanup temp zip
    fs.unlinkSync(zipPath);

    return NextResponse.json({ success: true, message: 'Update applied successfully' });
  } catch (error: any) {
    console.error('Update API Error:', error);
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 500 });
  }
}
