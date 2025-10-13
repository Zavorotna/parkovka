document.addEventListener("DOMContentLoaded", function () {
    const select = document.querySelector("#adress"),
        jsonUrl = "adresses.json",
        params = new URLSearchParams(window.location.search),
        adressParam = params.get("adress")

    let codeToLoad = null

    if (adressParam) {
        select.value = adressParam
        codeToLoad = adressParam
    } else if (select && select.value) {
        codeToLoad = select.value
    } else {
        codeToLoad = "ХМ001" 
    }

    loadAdressData(codeToLoad)

    select.addEventListener("change", function () {
        const val = select.value,
            newUrl = `${window.location.pathname}?adress=${val}`
        // console.log(val)
        window.history.pushState({}, "", newUrl)

        loadAdressData(val)
    })

    function loadAdressData(code) {
        fetch(jsonUrl)
            .then(res => res.json())
            .then(data => {
                // console.log(data)
                const point = data.find(item => item.id === code)
                // console.log(point)
                if (!point) return

                // --- Перевірка дня тижня ---
                const todayIndex = new Date().getDay()
                daysMap = ["нд", "пн", "вт", "ср", "чт", "пт", "сб"]
                todayName = daysMap[todayIndex]
                isDayMatch = point.grafick.includes(todayName)

                // --- Перевірка часу ---
                const now = new Date(),
                    [start, end] = point.time.split(" - "),
                    [sh, sm] = start.split(":").map(Number),
                    [eh, em] = end.split(":").map(Number)

                const startTime = new Date()
                startTime.setHours(sh, sm, 0, 0)
                const endTime = new Date()
                endTime.setHours(eh, em, 0, 0)

                const isTimeMatch = now >= startTime && now <= endTime

                // --- Ціни ---
                const pbPrice = document.querySelector(".price_pb p")
                pbPrice.innerHTML = `${isDayMatch && isTimeMatch ? point.pb : "0₴"} <span>/година</span>`

                const unipPrice = document.querySelector(".price_unip p")
                unipPrice.innerHTML = `${isDayMatch && isTimeMatch ? point.unip : "0₴"} <span>/година</span>`

                // --- Посилання на оплату ---

                //приват
                const pbLink = document.querySelector(".mask_pb")
                pbLink.href = point.linkPB

                //unip
                const unipLink = document.querySelector(".mask_unip")
                unipLink.href = point.linkUNIp

                //iframe
                const mapIframe = document.querySelector(".map")
                mapIframe.innerHTML = point.iframe
                
                const dayTime = document.querySelector(".day_time ")
                dayTime.textContent = point.day_time
                //map adress
                const parsed = point.terminalAdress.map(item => {
                    const match = item.value.match(/^(.+?)\((.+)\)$/)
                    if (match) {
                        return {
                            key: item.key,
                            address: match[1].trim(),
                            info: match[2].trim()
                        }
                    } else {
                        return {
                            key: item.key,
                            address: item.value.trim(),
                            info: ''
                        }
                    }
                })

                const grouped = {}
                parsed.forEach(item => {
                    if (!grouped[item.key]) grouped[item.key] = []
                    grouped[item.key].push({
                        address: item.address,
                        info: item.info
                    })
                })
                document.querySelector(".adress_text").innerHTML = ""
   
                for (const key in grouped) {
                    const pId = document.createElement('p'),
                        idHeader = document.querySelector(".id")
                    pId.classList.add('adress_id')
                    pId.textContent = key 
                    idHeader.textContent = key 
                    document.querySelector(".adress_text").appendChild(pId)

                    grouped[key].forEach(addr => {
                        const pText = document.createElement('p')
                        pText.classList.add('adress_text_terminal')

                        const span = document.createElement('span')
                        span.textContent = "(" + addr.info + ")"
                        pText.textContent = addr.address + ' '
                        pText.appendChild(span)

                        document.querySelector(".adress_text").appendChild(pText)
                    })
                }

            })
            .catch(err => console.error("JSON load error:", err))
    }
})