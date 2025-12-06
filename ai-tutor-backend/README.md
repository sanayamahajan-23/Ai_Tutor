


## Setup
Create a `.env` file at the root of the repository to add **ElevenLabs API Keys**. Refer to `.env.example` for the environment variable names and download the ollama and download model gemma3:4b
```
ollama run gemma3:4b
```

Download the **RhubarbLibrary** binary for your **OS** [here](https://github.com/DanielSWolf/rhubarb-lip-sync/releases) and put it in your `bin` folder. `rhubarb` executable should be accessible through `bin/rhubarb`.

Start the development server with
```
yarn
yarn dev
```
