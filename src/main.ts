import p5 from 'p5'

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.background(10, 10, 15)
  }

  p.draw = () => {
    p.background(10, 10, 15)
    // Proof of life: spinning circle
    p.fill(0, 240, 255)
    p.noStroke()
    p.ellipse(
      p.width / 2 + Math.cos(p.frameCount * 0.02) * 100,
      p.height / 2 + Math.sin(p.frameCount * 0.02) * 100,
      20
    )
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }
}

new p5(sketch)
