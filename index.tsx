/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from '@google/genai';

// --- DOM Element References ---
const promptInput = document.getElementById(
  'prompt-input',
) as HTMLTextAreaElement;
const aspectRatioSelect = document.getElementById(
  'aspect-ratio-select',
) as HTMLSelectElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const errorMessage = document.getElementById('error-message') as HTMLDivElement;
const imageDisplayArea = document.getElementById(
  'image-display-area',
) as HTMLDivElement;
const placeholder = document.getElementById('placeholder') as HTMLDivElement;

// Store the initial placeholder content
const placeholderHTML = placeholder.innerHTML;

// --- API Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a base64 encoded placeholder image with a specific aspect ratio.
 * @param aspectRatio The desired aspect ratio (e.g., "16:9").
 * @returns A base64 string of the generated PNG image (without the data URL prefix).
 */
function generatePlaceholderImage(aspectRatio: string): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  // Using a smaller dimension is sufficient for the model to get the ratio
  const MAX_DIMENSION = 512;
  let width, height;

  if (widthRatio >= heightRatio) {
    width = MAX_DIMENSION;
    height = Math.round((MAX_DIMENSION * heightRatio) / widthRatio);
  } else {
    height = MAX_DIMENSION;
    width = Math.round((MAX_DIMENSION * widthRatio) / heightRatio);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = '#f8f9fa'; // Match placeholder background
  ctx.fillRect(0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1];
}

/**
 * Calls the Gemini API to generate an image.
 */
async function generateImage() {
  const promptText = promptInput.value;
  if (!promptText) {
    showError('Please enter a prompt.');
    return;
  }

  const aspectRatio = aspectRatioSelect.value;
  setLoading(true);
  showError(''); // Clear previous errors

  try {
    const placeholderBase64 = generatePlaceholderImage(aspectRatio);
    const fullPrompt = `${promptText}. Do not change the input aspect ratio.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: [
        { text: fullPrompt },
        { inlineData: { mimeType: 'image/png', data: placeholderBase64 } },
      ],
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let hasImageOutput = false;
    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          displayImage(
            part.inlineData.data,
            part.inlineData.mimeType,
            promptText,
          );
          hasImageOutput = true;
          break; // Stop after finding the first image
        }
      }
    }

    if (!hasImageOutput) {
      showError(
        'The model did not return an image. Please try a different prompt.',
      );
    }
  } catch (e) {
    const error = e as Error;
    console.error(error);
    showError(`An error occurred: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

/**
 * Displays a generated image and a download button in the display area.
 */
function displayImage(base64Data: string, mimeType: string, altText: string) {
  // Clear previous content
  imageDisplayArea.innerHTML = '';
  imageDisplayArea.classList.add('has-image');

  // Create image
  const img = document.createElement('img');
  img.src = `data:${mimeType};base64,${base64Data}`;
  img.alt = altText;
  imageDisplayArea.appendChild(img);

  // Create download button
  const downloadLink = document.createElement('a');
  downloadLink.href = img.src;
  const safeFilename =
    altText.substring(0, 30).replace(/[^a-z0-9]/gi, '_') || 'genbanana-art';
  downloadLink.download = `${safeFilename}.png`;
  downloadLink.classList.add('download-btn');
  downloadLink.innerHTML = '<i class="fa-solid fa-download"></i>';
  downloadLink.setAttribute('aria-label', 'Download image');
  downloadLink.setAttribute('title', 'Download image');
  imageDisplayArea.appendChild(downloadLink);
}

/**
 * Shows an error message to the user.
 */
function showError(message: string) {
  if (message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
  } else {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
  }
}

/**
 * Clears any previous output (images and errors).
 */
function clearOutput() {
  imageDisplayArea.innerHTML = '';
  // Re-create the placeholder from stored HTML
  const placeholderDiv = document.createElement('div');
  placeholderDiv.id = 'placeholder';
  placeholderDiv.innerHTML = placeholderHTML;
  imageDisplayArea.appendChild(placeholderDiv);
  imageDisplayArea.classList.remove('has-image');
}

/**
 * Toggles the loading state of the UI.
 */
function setLoading(isLoading: boolean) {
  if (isLoading) {
    clearOutput();
    imageDisplayArea.innerHTML = `
      <span class="banana-loader" role="img" aria-label="Loading">🍌</span>
      <p>Generating with Banana Power...</p>
    `;
    imageDisplayArea.classList.add('loading');
    generateBtn.disabled = true;
    generateBtn.innerHTML =
      '<i class="fa-solid fa-hourglass-half"></i> Generating...';
  } else {
    // If the area still shows a loader (e.g., in case of an error) and doesn't have an image, restore placeholder.
    if (
      imageDisplayArea.classList.contains('loading') &&
      !imageDisplayArea.classList.contains('has-image')
    ) {
      clearOutput();
    }
    imageDisplayArea.classList.remove('loading');
    generateBtn.disabled = false;
    generateBtn.innerHTML =
      '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate';
  }
}

// --- Event Listeners ---
generateBtn.addEventListener('click', generateImage);
promptInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    generateImage();
  }
});
