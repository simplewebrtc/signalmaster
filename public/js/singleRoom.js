(function() {

  const addGetSimilarListeners = () => {
    const elementInfo = [
        {button: 'get-similar-room-difference-button', route: 'rooms', input: 'get-similar-room-difference-input'}
      ];
    elementInfo.forEach((el) => {
      const button = document.querySelector(`[data-text="${el.button}"]`)
      const input = document.querySelector(`[data-text="${el.input}"]`)
      button.addEventListener('click', () => location.href += `?similar=true&lt=${input.value}&gt=${input.value}`)
    })
  }

  return {
    init: function() {
      addGetSimilarListeners()
    }
  }
})().init()