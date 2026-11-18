import { useFeedback } from '@/stores/feedback'
import { displayPhoto } from './presentation'
export function mediaSource(src: string) {
  // #ifdef APP-PLUS
  if (src.startsWith('/static/')) return '_www' + src
  // #endif
  return src
}
async function retain(path: string): Promise<string> {
  // #ifdef H5
  const blob = await (await fetch(path)).blob()
  if (blob.size > 1.5 * 1024 * 1024)
    throw new Error('本地体验请选小于1.5MB的文件，避免设备存储不足')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('文件暂时无法读取'))
    reader.readAsDataURL(blob)
  })
  // #endif
  // #ifdef APP-PLUS
  return new Promise((resolve, reject) =>
    uni.saveFile({
      tempFilePath: path,
      success: (r) => resolve(r.savedFilePath),
      fail: () => reject(new Error('文件未能保存在设备上，请再试一次')),
    }),
  )
  // #endif
  return path
}
export async function chooseMedia(type: 'photo' | 'video'): Promise<string | null> {
  try {
    const path = await new Promise<string>((resolve, reject) => {
      if (type === 'photo')
        uni.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album'],
          success: (r) => resolve((r.tempFilePaths as string[])[0]),
          fail: reject,
        })
      else
        uni.chooseVideo({
          sourceType: ['album'],
          maxDuration: 30,
          compressed: true,
          success: (r) => resolve(r.tempFilePath),
          fail: reject,
        })
    })
    return await retain(path)
  } catch (e) {
    const msg = e instanceof Error ? e.message : ((e as { errMsg?: string })?.errMsg ?? '')
    if (!/cancel/i.test(msg)) useFeedback().notify(msg || '没有选到文件，请再试一次')
    return null
  }
}
export function previewPhotos(urls: string[], current = 0) {
  if (urls.length)
    uni.previewImage({
      urls: urls.map(displayPhoto),
      current,
      fail: () => useFeedback().notify('照片暂时无法打开，请再试一次'),
    })
}
export async function clearSavedFiles() {
  // #ifdef APP-PLUS
  const files = await new Promise<UniApp.GetSavedFileListSuccess>((resolve, reject) =>
    uni.getSavedFileList({ success: resolve, fail: reject }),
  )
  for (const file of files.fileList)
    await new Promise<void>((resolve, reject) =>
      uni.removeSavedFile({
        filePath: file.filePath,
        success: () => resolve(),
        fail: () => reject(new Error('部分本地附件尚未清理，请再试一次')),
      }),
    )
  // #endif
}
