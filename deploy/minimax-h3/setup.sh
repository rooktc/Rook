#!/usr/bin/env bash
# MiniMax-H3 local deployment: installs ComfyUI and downloads the right
# quantization tier for the detected GPU. See README.md in this directory.
set -euo pipefail

COMFY_DIR="${HOME}/ComfyUI"
TIER=""

usage() {
  echo "Usage: $0 [--tier int8|nvfp4|int4] [--dir <comfyui-install-dir>]"
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tier) TIER="$2"; shift 2 ;;
    --dir)  COMFY_DIR="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown option: $1"; usage ;;
  esac
done

# ---------- preflight ----------
if ! command -v nvidia-smi >/dev/null 2>&1; then
  echo "ERROR: nvidia-smi not found. MiniMax-H3 needs an NVIDIA GPU (16 GB VRAM minimum)."
  echo "Run this script on your GPU machine, not a CPU-only host."
  exit 1
fi

VRAM_MB=$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | sort -rn | head -1)
echo "Detected GPU VRAM: ${VRAM_MB} MiB"

if [[ -z "$TIER" ]]; then
  if   (( VRAM_MB >= 30000 )); then TIER="int8"
  elif (( VRAM_MB >= 22000 )); then TIER="int8"   # 24 GB cards: int8 with CPU offload
  elif (( VRAM_MB >= 15000 )); then TIER="int4"
  else
    echo "ERROR: ${VRAM_MB} MiB VRAM is below the 16 GB minimum for MiniMax-H3."
    exit 1
  fi
  echo "Auto-selected tier: ${TIER} (override with --tier)"
fi

FREE_DISK_GB=$(df -BG --output=avail "$(dirname "$COMFY_DIR")" | tail -1 | tr -dc '0-9')
if (( FREE_DISK_GB < 60 )); then
  echo "WARNING: only ${FREE_DISK_GB} GB free; the ${TIER} tier needs ~40-60 GB."
fi

# ---------- ComfyUI ----------
if [[ -d "$COMFY_DIR/.git" ]]; then
  echo "Updating existing ComfyUI at ${COMFY_DIR} (H3 needs the 2026-08-03+ release)..."
  git -C "$COMFY_DIR" pull --ff-only
else
  echo "Cloning ComfyUI into ${COMFY_DIR}..."
  git clone https://github.com/comfyanonymous/ComfyUI.git "$COMFY_DIR"
fi

cd "$COMFY_DIR"
if [[ ! -d venv ]]; then
  python3 -m venv venv
fi
# shellcheck disable=SC1091
source venv/bin/activate
pip install --upgrade pip
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
pip install -r requirements.txt
pip install -U "huggingface_hub[cli]"

mkdir -p models/diffusion_models models/text_encoders models/vae

# ---------- model downloads ----------
# Filename patterns are used (not hard-coded repo paths) so downloads survive
# upstream directory re-organisation.
dl() { # dl <repo> <include-pattern> <dest-dir>
  hf download "$1" --include "$2" --local-dir "$3"
}

echo "Downloading VAEs (video fp16 ~4.8 GB, audio fp32 ~0.6 GB)..."
dl Comfy-Org/MiniMax-H3 "*minimax_h3_video_vae_fp16*" models/vae
dl Comfy-Org/MiniMax-H3 "*minimax_h3_audio_vae_fp32*" models/vae

echo "Downloading Qwen3-VL text encoder (NVFP4 AWQ, ~14.6 GB)..."
dl Comfy-Org/MiniMax-H3 "*qwen3vl_32b*nvfp4*" models/text_encoders

case "$TIER" in
  int8)
    echo "Downloading FL2VA DiT, pruned int8_convrot (~19.5 GB)..."
    dl Comfy-Org/MiniMax-H3 "*fl2va*int8*" models/diffusion_models
    ;;
  nvfp4)
    echo "Downloading FL2VA DiT, pruned NVFP4 (~12 GB)..."
    dl Comfy-Org/MiniMax-H3 "*fl2va*nvfp4*" models/diffusion_models
    ;;
  int4)
    echo "Downloading FL2VA DiT, int4 (~11.3 GB)..."
    dl Comfy-Org/MiniMax-H3 "*fl2va*int4*" models/diffusion_models
    ;;
  *) echo "Unknown tier: ${TIER}"; usage ;;
esac

# Downloaded files can land in nested dirs mirroring the repo; flatten them.
for d in models/vae models/text_encoders models/diffusion_models; do
  find "$d" -mindepth 2 -name '*.safetensors' -exec mv -n {} "$d"/ \;
  find "$d" -mindepth 1 -type d -empty -delete
done

echo
echo "Done. Start ComfyUI with:"
echo "  cd ${COMFY_DIR} && source venv/bin/activate && python main.py"
if (( VRAM_MB < 30000 )); then
  echo "  (24 GB card: add --lowvram if you hit OOM)"
fi
echo "Then open http://127.0.0.1:8188 and load a MiniMax H3 video template"
echo "(Workflow -> Browse Templates -> Video)."
