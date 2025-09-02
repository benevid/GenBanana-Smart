# GenBanana - AI Image Generation

GenBanana is a web-based tool that allows you to generate unique images using Google's powerful `gemini-2.5-flash-image-preview` model. Simply enter a text prompt, choose your desired aspect ratio, and let the AI bring your ideas to life.

![GenBanana Screenshot](images/Um_camaro_amarelo_com_rodas_al.png)
*(Note: You will need to add a screenshot of the application to an `images` folder for the image above to display correctly.)*

## Key Features

-   **Text-to-Image Generation**: Create stunning visuals from simple text descriptions.
-   **Aspect Ratio Control**: Generate images in various formats like Square (1:1), Widescreen (16:9), and Portrait (9:16).
-   **Download Functionality**: Easily save your favorite creations with a single click.
-   **Clean & Responsive UI**: A simple, intuitive, and mobile-friendly interface.

## The Aspect Ratio Trick: How It Works

A unique challenge with the `gemini-2.5-flash-image-preview` model is that its API does not currently offer a direct `aspectRatio` parameter to control the dimensions of the output image.

To solve this, GenBanana employs a clever workaround:

1.  **Dynamic Mask Generation**: When you select an aspect ratio (e.g., "16:9"), the application dynamically creates a blank placeholder image (an HTML canvas) in memory with that exact ratio.
2.  **Image Mask as Input**: This placeholder is converted into a base64 string and sent to the Gemini API *along with* your text prompt.
3.  **Simulating Image Editing**: By providing both an image and text, we frame the request as an "image editing" task rather than a simple text-to-image generation. The model is designed to preserve the aspect ratio of the input image in such tasks.
4.  **Controlled Output**: The model uses the blank placeholder as a dimensional guide, effectively generating your new image within the desired aspect ratio.

This technique ensures you have creative control over the final composition, even without a native API parameter.

## How to Use

1.  **Enter a Prompt**: In the text box, describe the image you want to create. Be as descriptive as you like!
2.  **Select Aspect Ratio**: Choose your desired format from the dropdown menu.
3.  **Generate**: Click the "Generate" button.
4.  **Download**: Once the image appears, hover over it and click the download icon to save it to your device.

## Technology Stack

-   **HTML5**
-   **CSS3**
-   **TypeScript**
-   **Google Gemini API** (`@google/genai`)
