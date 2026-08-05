# MiniMax-H3 — local deployment kit

[MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3) is MiniMax's open-weights
**video + stereo audio generation model** (a ~33B DiT generator; ~69B parameters across
the full stack: generator, Qwen3-VL-32B text encoder, video VAE, audio VAE). It produces
video *with synchronized audio* in a single forward pass, supporting text-to-video,
image-to-video, and reference-to-video.

This is **not** a chat/LLM model — it will not serve an OpenAI-style text API. The
practical local path is **ComfyUI**, which shipped day-0 native support.

## Hardware requirements (pick your tier)

| Tier | GPU | Files | Notes |
|------|-----|-------|-------|
| Full precision | 80 GB+ (A100/H100/MI300X), multi-GPU | official 42.5 GB (T2V/I2V) + 21 GB (Ref2VA) | SGLang / vLLM recipes; datacenter only |
| INT8 (recommended consumer) | 32 GB (RTX 5090) | ~40 GB total | pruned int8 DiT 19.5 GB + NVFP4 text encoder 14.6 GB + VAEs |
| INT8 on 24 GB | RTX 4090/3090 | same as above | works with CPU offload of the text encoder; slower due to RAM swapping |
| NVFP4 | 32 GB (RTX 5090) | ~31.7 GB total | ~27 GB peak VRAM, ~175 s for a 10 s 864×480 clip |
| INT4 | 16 GB cards | ~11.3 GB DiT | community quants; quality tradeoffs |

Also budget: **64 GB system RAM recommended** (text-encoder offload + latents) and
~60 GB free disk.

FP8 is **not** supported at time of writing (known transformer-side blocker deferred
past the day-0 release) — don't hunt for fp8 files. There is also **no official GGUF**;
"GGUF H3" files circulating online are fakes.

## Quick start

```bash
./setup.sh            # auto-detects VRAM, installs ComfyUI, downloads the right files
./setup.sh --tier int4    # or force a tier: int8 | nvfp4 | int4
./setup.sh --dir ~/comfy  # choose the install location (default: ~/ComfyUI)
```

Then:

```bash
cd ~/ComfyUI && source venv/bin/activate
python main.py            # open http://127.0.0.1:8188
```

In the ComfyUI UI: **Workflow → Browse Templates → Video** and pick a MiniMax H3
template (text-to-video / image-to-video), or build manually:

- **CLIPLoader** (`type = minimax`) → `qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`
- **UNETLoader / Load Diffusion Model** → the `minimax_h3_fl2va_*` checkpoint
- **VAELoader** → `minimax_h3_video_vae_fp16.safetensors` (plus the audio VAE for sound)

## Where the files go

```
ComfyUI/models/
├── diffusion_models/   minimax_h3_fl2va_…​.safetensors        (the DiT)
├── text_encoders/      qwen3vl_32b_minimax_h3_…​.safetensors  (Qwen3-VL encoder)
└── vae/                minimax_h3_video_vae_fp16.safetensors
                        minimax_h3_audio_vae_fp32.safetensors
```

ComfyUI must be **recent** (≥ the 2026-08-03 release that added H3 nodes). The setup
script clones latest master; if you already run ComfyUI, `git pull` + restart.

## Reference-to-video (optional)

Ref2VA uses a separate ~21 GB diffusion checkpoint on top of the base download. Grab it
only if you need reference conditioning:

```bash
hf download Comfy-Org/MiniMax-H3 --include "*ref2va*" \
  --local-dir ~/ComfyUI/models/diffusion_models
```

## Datacenter path (no ComfyUI)

On 4× MI300X/MI355X or comparable NVIDIA hardware, the official weights run under
SGLang:

```bash
hf download MiniMaxAI/MiniMax-H3 --local-dir ./MiniMax-H3
python -m sglang.launch_server --model ./MiniMax-H3 \
  --ulysses-degree 4 --performance-mode speed
```

See the [SGLang H3 cookbook](https://lmsysorg.mintlify.app/cookbook/diffusion/MiniMax/MiniMax-H3)
and [vLLM recipes](https://recipes.vllm.ai/MiniMaxAI/MiniMax-H3).

## Sources

- [MiniMaxAI/MiniMax-H3 model card](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Comfy-Org repackaged weights](https://huggingface.co/Comfy-Org/MiniMax-H3)
- [ComfyUI official H3 tutorial](https://docs.comfy.org/tutorials/video/minimax/minimax-h3)
- [ComfyUI Wiki H3 guide](https://comfyui-wiki.com/en/tutorial/advanced/video/minimax/minimax-h3)
- [RTX 5090 NVFP4 benchmark](https://ai-muninn.com/en/blog/minimax-h3-nvfp4-rtx5090)
- [Open-weights release notes (42.5 GB)](https://www.atlascloud.ai/blog/guides/minimax-h3-open-source-weights)
- [MiniMax official local-deploy docs](https://platform.minimax.io/docs/guides/local-deploy)
