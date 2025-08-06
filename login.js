const kakaoLoginButton = document.querySelector("#kakao")

const profileImage = document.querySelector("img")
const userName = document.querySelector("#user_name")
const logoutButton = document.querySelector("#logout_button")

const redirectUri = "http://localhost:5500"
let kakaoClientId = null
let kakaoAccessToken = null

axios.defaults.baseURL = "http://localhost:3000"
axios.defaults.headers.common["Content-Type"] = "text/plain"

const updateProfile = (nickname, profile_image) => {
    userName.innerText = nickname
    profileImage.src = profile_image
}

/** KAKAO env */
const updateKakaoEnv = async () => {
    if (kakaoClientId) { return }
    const response = await axios.get("/kakao/env")
    if (!response || !response.data) { console.error("---- ERROR OCCURRED: Fail to get api key") }
    kakaoClientId = response.data
}

/** KAKAO env -> auth code */
kakaoLoginButton.addEventListener("click", async () => {
    await updateKakaoEnv()
    location.href = `https://kauth.kakao.com/oauth/authorize/?client_id=${kakaoClientId}&redirect_uri=${redirectUri}&response_type=code`
})

/** KAKAO code -> token */
const updateKakaoAccessToken = async (authorizationCode) => {
    const accessTokenResponse = await axios.post("/kakao/code-to-token", authorizationCode)
    kakaoAccessToken = accessTokenResponse.data
}

/** token -> user info */
const getKakaoUserInfo = async () => {
    const response = await axios.post("/kakao/user-info", kakaoAccessToken)
    const { nickname, profile_image, thumbnail_image } = response.data
    return { nickname, profile_image, thumbnail_image }
}

const kakaoLogout = async () => {
    if (!kakaoAccessToken) {
        console.error("---- ERROR: No access token")
        debugger
        return
    }
    const _response = await axios.post("/kakao/logout", undefined, { headers: { "Authorization": `Bearer ${kakaoAccessToken}` } })
    updateProfile("", "")
}

/** code -> token -> ui */
window.onload = async () => {
    const searchParams = new URLSearchParams(window.location.search)

    const authorizationCode = searchParams.get("code")
    if (!authorizationCode) {
        console.error("---- got no code from kakao even after redirect")
        return
    }
      await updateKakaoAccessToken(authorizationCode)
      const { nickname, profile_image} = await getKakaoUserInfo()
      updateProfile(nickname, profile_image)
}

logoutButton.addEventListener("click", async () => {
            await kakaoLogout()

})