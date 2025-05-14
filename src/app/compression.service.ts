import { Injectable } from '@angular/core';
import Compressor from 'compressorjs';

@Injectable({
  providedIn: 'root'
})
export class CompressionService {
  constructor() { }

  compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      // Targeting size in bytes (40% of original)
      const targetSize = Math.floor(file.size * 0.4);

      // Using Compressor.js for better quality and easier size targeting
      new Compressor(file, {
        quality: 0.8, // Initial quality, we can adjust if needed
        convertSize: Infinity, // Always compress
        success(result: File) {
          // If already under target, resolve
          if (result.size <= targetSize + 100 * 1024) { 
            resolve(result);
          } else {
            // Trying for a lower quality if still too big
            new Compressor(file, {
              quality: 0.5,
              convertSize: Infinity,
              success(secondResult: File) {
                resolve(secondResult.size <= targetSize + 100 * 1024 ? secondResult : secondResult);
              },
              error() {
                resolve(file);
              }
            });
          }
        },
        error() {
          resolve(file);
        }
      });
    });
  }
}
