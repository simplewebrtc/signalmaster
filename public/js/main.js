(function() {
  const addHeaderListeners = () => {
    const elementInfo = [
      {button: 'room-search-button', route: 'rooms', input: 'room-search-input'}, 
      {button: 'user-search-button', route: 'users', input: 'user-search-input'}
    ];
    elementInfo.forEach((el) => {
      const button = document.querySelector(`[data-text="${el.button}"]`)
      const input = document.querySelector(`[data-text="${el.input}"]`)
      button.addEventListener('click', () => {
        location.href = `${location.protocol}//${location.host}/dashboard/${el.route}/${input.value}`
      })
    })
  }

  return {
    init: function() {
      addHeaderListeners()
    }
  }
})().init()