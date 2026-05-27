"""Model components shared by training export and inference.

The exported `.keras` model depends on a custom `MelSpectrogramLayer`.
Keeping it in a standalone module avoids importing FastAPI for CLI tools.
"""

from __future__ import annotations

from typing import Any

import tensorflow as tf


@tf.keras.utils.register_keras_serializable(package="Heartz")
class MelSpectrogramLayer(tf.keras.layers.Layer):
    """Raw waveform -> normalized log-mel spectrogram.

    This must stay compatible with the layer used during training/export.
    """

    def __init__(
        self,
        sample_rate: int = 16_000,
        frame_length: int = 400,
        frame_step: int = 160,
        fft_length: int = 512,
        num_mel_bins: int = 64,
        lower_edge_hertz: float = 80.0,
        upper_edge_hertz: float = 7_600.0,
        eps: float = 1e-6,
        **kwargs: Any,
    ) -> None:
        super().__init__(**kwargs)
        self.sample_rate = int(sample_rate)
        self.frame_length = int(frame_length)
        self.frame_step = int(frame_step)
        self.fft_length = int(fft_length)
        self.num_mel_bins = int(num_mel_bins)
        self.lower_edge_hertz = float(lower_edge_hertz)
        self.upper_edge_hertz = float(upper_edge_hertz)
        self.eps = float(eps)
        self._mel_weight_matrix = None

    def build(self, input_shape):
        num_spectrogram_bins = self.fft_length // 2 + 1
        mel_weight_matrix = tf.signal.linear_to_mel_weight_matrix(
            num_mel_bins=self.num_mel_bins,
            num_spectrogram_bins=num_spectrogram_bins,
            sample_rate=self.sample_rate,
            lower_edge_hertz=self.lower_edge_hertz,
            upper_edge_hertz=self.upper_edge_hertz,
        )
        self._mel_weight_matrix = tf.constant(mel_weight_matrix, dtype=tf.float32)
        super().build(input_shape)

    def call(self, inputs, training=None):
        waveform = tf.cast(inputs, tf.float32)
        if waveform.shape.rank == 3 and waveform.shape[-1] == 1:
            waveform = tf.squeeze(waveform, axis=-1)

        stft = tf.signal.stft(
            waveform,
            frame_length=self.frame_length,
            frame_step=self.frame_step,
            fft_length=self.fft_length,
            window_fn=tf.signal.hann_window,
            pad_end=True,
        )
        magnitude = tf.abs(stft)
        power_spectrogram = tf.square(magnitude)
        mel_spectrogram = tf.tensordot(power_spectrogram, self._mel_weight_matrix, axes=1)
        mel_spectrogram.set_shape(power_spectrogram.shape[:-1].concatenate([self.num_mel_bins]))
        log_mel = tf.math.log(mel_spectrogram + self.eps)
        mean = tf.reduce_mean(log_mel, axis=[1, 2], keepdims=True)
        std = tf.math.reduce_std(log_mel, axis=[1, 2], keepdims=True)
        log_mel = (log_mel - mean) / (std + self.eps)
        return tf.expand_dims(log_mel, axis=-1)

    def get_config(self) -> dict[str, Any]:
        config = super().get_config()
        config.update(
            {
                "sample_rate": self.sample_rate,
                "frame_length": self.frame_length,
                "frame_step": self.frame_step,
                "fft_length": self.fft_length,
                "num_mel_bins": self.num_mel_bins,
                "lower_edge_hertz": self.lower_edge_hertz,
                "upper_edge_hertz": self.upper_edge_hertz,
                "eps": self.eps,
            }
        )
        return config
