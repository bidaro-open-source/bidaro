const channelInstances: { [key: string]: BroadcastChannel } = {}

export function useBroadcast(channel: string) {
  if (!channelInstances[channel])
    channelInstances[channel] = new BroadcastChannel(channel)

  const broadcast = channelInstances[channel]

  onUnmounted(() => {
    // eslint-disable-next-line node/prefer-global/process
    if (process.env.NODE_ENV !== 'development') {
      broadcast.close()
      delete channelInstances[channel]
    }
  })

  return broadcast
}
