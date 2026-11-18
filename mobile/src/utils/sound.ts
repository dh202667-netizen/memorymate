/** Short local success cue; never changes the device's system volume. */
export function playSuccessCue() {
  // #ifdef H5
  const player = new Audio('/static/audio/feedback.wav')
  player.volume = 0.35
  void player.play().catch(() => {})
  // #endif
  // #ifndef H5
  const nativePlayer = uni.createInnerAudioContext()
  nativePlayer.src = '_www/static/audio/feedback.wav'
  nativePlayer.volume = 0.35
  nativePlayer.onEnded(() => nativePlayer.destroy())
  nativePlayer.onError(() => nativePlayer.destroy())
  nativePlayer.play()
  // #endif
}
