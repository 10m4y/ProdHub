import { useEffect } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const ScrollAnimations = () => {
        useEffect(() => {
                gsap.from(".fade-in", {
                        opacity: 0,
                        y: 50,
                        duration: 1.2,
                        stagger: 0.3,
                        scrollTrigger: {
                                trigger: ".fade-in",
                                start: "top 80%",
                                end: "bottom 50%",
                                scrub: 1,
                        },
                })

                gsap.from(".slide-left", {
                        opacity: 0,
                        x: -100,
                        duration: 1.5,
                        ease: "power2.out",
                        scrollTrigger: {
                                trigger: ".slide-left",
                                start: "top 85%",
                                end: "bottom 60%",
                                scrub: 1,
                        },
                })

                gsap.from(".slide-right", {
                        opacity: 0,
                        x: 100,
                        duration: 1.5,
                        ease: "power2.out",
                        scrollTrigger: {
                                trigger: ".slide-right",
                                start: "top 85%",
                                end: "bottom 60%",
                                scrub: 1,
                        },
                })

                // Ensure smooth updates
                ScrollTrigger.refresh()
        }, [])

        return null
}

export default ScrollAnimations
