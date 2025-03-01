import { useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import Lenis from "@studio-freight/lenis"

gsap.registerPlugin(ScrollTrigger)

const SmoothScroll = () => {
        useEffect(() => {
                const lenis = new Lenis({
                        duration: 1.5,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                })

                function raf(time) {
                        lenis.raf(time)
                        requestAnimationFrame(raf)
                }

                requestAnimationFrame(raf)

                return () => lenis.destroy()
        }, [])

        return null
}

export default SmoothScroll
