import pytest
from app import allowed_file, get_wordnet_pos
from nltk.corpus.reader.wordnet import NOUN, VERB, ADJ, ADV


def test_allowed_file_valid():
    assert allowed_file("video.mp4") == True
    assert allowed_file("clip.avi") == True


def test_allowed_file_invalid():
    assert allowed_file("video.txt") == False
    assert allowed_file("image.jpg") == False


def test_get_wordnet_pos():
    assert get_wordnet_pos("JJ") == ADJ
    assert get_wordnet_pos("VB") == VERB
    assert get_wordnet_pos("NN") == NOUN
    assert get_wordnet_pos("RB") == ADV


def test_get_wordnet_pos_default():
    # Unknown tags default to NOUN
    assert get_wordnet_pos("XYZ") == NOUN