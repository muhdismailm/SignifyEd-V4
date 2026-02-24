import torch
from .model import Encoder, Decoder, Seq2Seq  # relative import (correct)
import os
import pickle

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = None
input_vocab = None
output_vocab = None
inv_output_vocab = None


def load_model():
    global model, input_vocab, output_vocab, inv_output_vocab

    if model is not None:
        return

    # -------- Absolute Paths --------
    input_vocab_path = os.path.join(BASE_DIR, "input_vocab.pkl")
    output_vocab_path = os.path.join(BASE_DIR, "output_vocab.pkl")
    model_path = os.path.join(BASE_DIR, "seq2seq_model.pt")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")

    if not os.path.exists(input_vocab_path):
        raise FileNotFoundError(f"Input vocab not found: {input_vocab_path}")

    if not os.path.exists(output_vocab_path):
        raise FileNotFoundError(f"Output vocab not found: {output_vocab_path}")

    # -------- Load Vocab --------
    with open(input_vocab_path, "rb") as f:
        input_vocab = pickle.load(f)

    with open(output_vocab_path, "rb") as f:
        output_vocab = pickle.load(f)

    inv_output_vocab = {v: k for k, v in output_vocab.items()}

    # -------- Model Init --------
    INPUT_DIM = len(input_vocab)
    OUTPUT_DIM = len(output_vocab)
    EMB_DIM = 128
    HID_DIM = 256

    encoder = Encoder(INPUT_DIM, EMB_DIM, HID_DIM)
    decoder = Decoder(OUTPUT_DIM, EMB_DIM, HID_DIM)
    model = Seq2Seq(encoder, decoder)

    model.load_state_dict(torch.load(model_path, map_location=torch.device("cpu")))
    model.eval()


def generate_gloss(sentence):

    load_model()

    tokens = sentence.lower().split()
    indices = [input_vocab.get(tok, input_vocab["<unk>"]) for tok in tokens]
    src_tensor = torch.tensor(indices).unsqueeze(0)

    hidden, cell = model.encoder(src_tensor)

    input_token = torch.tensor([output_vocab["<sos>"]])
    generated_tokens = []

    for _ in range(20):
        output, hidden, cell = model.decoder(input_token, hidden, cell)
        top1 = output.argmax(1)
        token = inv_output_vocab[top1.item()]

        if token == "<eos>":
            break

        generated_tokens.append(token)
        input_token = top1

    return generated_tokens
