import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  Clock3,
  Leaf,
  MoveUpRight,
  Play,
  Sparkles,
  Truck,
} from "lucide-react";

import { getPizzas } from "../services/pizzaService";

import "./Home.css";

function Home() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const heroVisualRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorTextRef = useRef(null);
  const cursorPosition = useRef({
    x: 0,
    y: 0,
  });
  const cursorTarget = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const loadPizzas = async () => {
      try {
        const data = await getPizzas();
        setPizzas(data.pizzas || data || []);
      } catch (error) {
        console.error("Failed to load pizzas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPizzas();
  }, []);

  /* =========================================
  PREMIUM CUSTOM CURSOR
========================================= */

useEffect(() => {
 const cursor = cursorRef.current;
 const dot = cursorDotRef.current;
 const text = cursorTextRef.current;

 if (!cursor || !dot || !text) return;

 let animationFrame;

 const moveCursor = (event) => {
   cursorTarget.current.x = event.clientX;
   cursorTarget.current.y = event.clientY;

   cursor.classList.add("is-active");

   const interactive = event.target.closest(
     "a, button, .home-pizza-card, .home-hero-image-wrap, .home-showcase-browser"
   );

   if (interactive) {
     cursor.classList.add("is-hover");

     if (
       interactive.classList.contains("home-pizza-card") ||
       interactive.classList.contains("home-hero-image-wrap") ||
       interactive.classList.contains("home-showcase-browser")
     ) {
       text.textContent = "VIEW";
     } else {
       text.textContent = "GO";
     }
   } else {
     cursor.classList.remove("is-hover");
     text.textContent = "";
   }
 };

 const animateCursor = () => {
   cursorPosition.current.x +=
     (cursorTarget.current.x -
       cursorPosition.current.x) *
     0.14;

   cursorPosition.current.y +=
     (cursorTarget.current.y -
       cursorPosition.current.y) *
     0.14;

   const x = cursorPosition.current.x;
   const y = cursorPosition.current.y;

   cursor.style.transform =
  `translate3d(${x}px, ${y}px, 0)`;

dot.style.transform =
  `translate3d(${x}px, ${y}px, 0)`;

   animationFrame =
     requestAnimationFrame(animateCursor);
 };

 const handleMouseLeave = () => {
   cursor.classList.remove("is-active");
 };

 const handleMouseEnter = () => {
   cursor.classList.add("is-active");
 };

 window.addEventListener(
   "mousemove",
   moveCursor,
   { passive: true }
 );

 document.addEventListener(
   "mouseleave",
   handleMouseLeave
 );

 document.addEventListener(
   "mouseenter",
   handleMouseEnter
 );

 animationFrame =
   requestAnimationFrame(animateCursor);

 document.body.classList.add(
   "home-custom-cursor-active"
 );

 return () => {
   window.removeEventListener(
     "mousemove",
     moveCursor
   );

   document.removeEventListener(
     "mouseleave",
     handleMouseLeave
   );

   document.removeEventListener(
     "mouseenter",
     handleMouseEnter
   );

   cancelAnimationFrame(animationFrame);

   document.body.classList.remove(
     "home-custom-cursor-active"
   );
 };
}, []);

  /* =========================================
     SCROLL PROGRESS
  ========================================= */

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        documentHeight > 0
          ? (scrollTop / documentHeight) * 100
          : 0;

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================
     SCROLL REVEALS
  ========================================= */

  useEffect(() => {
    const elements = document.querySelectorAll(
      "[data-reveal]"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pizzas]);

  /* =========================================
     HERO MOUSE PARALLAX
  ========================================= */

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!heroVisualRef.current) return;

      const x =
        (event.clientX / window.innerWidth - 0.5) * 18;

      const y =
        (event.clientY / window.innerHeight - 0.5) * 18;

      heroVisualRef.current.style.setProperty(
        "--mouse-x",
        `${x}px`
      );

      heroVisualRef.current.style.setProperty(
        "--mouse-y",
        `${y}px`
      );
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  const popularPizzas = pizzas.slice(0, 4);
  const heroPizza = pizzas[0];
  const showcasePizza = pizzas[1] || pizzas[0];
  const finalPizza = pizzas[2] || pizzas[0];

  return (
      <main className="home-page">    
      {/* SCROLL PROGRESS */}

      <div
        className="home-scroll-progress"
        style={{
          width: `${scrollProgress}%`,
        }}
      />

      {/* =========================================
          HERO
      ========================================= */}

      <section className="home-hero">
        <div className="home-hero-noise" />

        <div className="home-hero-orbit home-orbit-one" />
        <div className="home-hero-orbit home-orbit-two" />

        <div className="container home-hero-inner">
          <div
            className="home-hero-content"
            data-reveal="hero"
          >
            <div className="home-hero-index">
              <span>01</span>
              <span className="home-index-line" />
              <span>PIZZAGO</span>
            </div>

            <p className="home-hero-eyebrow">
              AUTHENTIC • FRESH • HANDCRAFTED
            </p>

            <h1 className="home-hero-title">
              <span>Real</span>
              <span>Pizza.</span>
              <em>Real</em>
              <em>Happiness.</em>
            </h1>

            <p className="home-hero-description">
              Handcrafted pizzas, bold flavours and
              ingredients chosen with care — made your way
              and delivered hot to your door.
            </p>

            <div className="home-hero-actions">
              <Link
                to="/menu"
                className="home-magnetic-button"
              >
                <span>Explore Menu</span>
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/menu"
                className="home-outline-button"
              >
                <span>Build your pizza</span>
                <MoveUpRight size={16} />
              </Link>
            </div>

            <div className="home-hero-meta">
              <div>
                <strong>20+</strong>
                <span>Pizza choices</span>
              </div>

              <div>
                <strong>30–40</strong>
                <span>Min delivery</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Fresh ingredients</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL */}

          <div
            ref={heroVisualRef}
            className="home-hero-visual"
            data-reveal="hero-visual"
          >
            <div className="home-hero-circle" />

            <div className="home-hero-small-circle" />

            {heroPizza ? (
              <Link
                to={`/pizza/${heroPizza._id}`}
                className="home-hero-image-wrap"
              >
                <img
                  src={heroPizza.image}
                  alt={heroPizza.name}
                  className="home-hero-image"
                />
              </Link>
            ) : (
              <div className="home-hero-placeholder">
                🍕
              </div>
            )}

            <div className="home-floating-card home-card-top">
              <Sparkles size={15} />
              <div>
                <span>FRESHLY BAKED</span>
                <strong>Every order</strong>
              </div>
            </div>

            <div className="home-floating-card home-card-bottom">
              <Truck size={16} />
              <div>
                <span>DELIVERY</span>
                <strong>Hot to your door</strong>
              </div>
            </div>

            <div className="home-hero-label">
              <span>SCROLL</span>
              <ArrowDownRight size={17} />
            </div>

            <div className="home-hero-pizza-name">
              <span>01</span>

              <div>
                <small>Today's favourite</small>
                <strong>
                  {heroPizza?.name || "Fresh Pizza"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          MARQUEE
      ========================================= */}

      <section className="home-marquee">
        <div className="home-marquee-track">
          <span>FRESH INGREDIENTS</span>
          <i>✦</i>
          <span>HANDCRAFTED PIZZA</span>
          <i>✦</i>
          <span>MADE YOUR WAY</span>
          <i>✦</i>
          <span>FAST DELIVERY</span>
          <i>✦</i>

          <span>FRESH INGREDIENTS</span>
          <i>✦</i>
          <span>HANDCRAFTED PIZZA</span>
          <i>✦</i>
          <span>MADE YOUR WAY</span>
          <i>✦</i>
          <span>FAST DELIVERY</span>
          <i>✦</i>
        </div>
      </section>

      {/* =========================================
          INTRODUCTION
      ========================================= */}

      <section className="home-intro">
        <div className="container">
          <div className="home-section-top">
            <span className="home-section-number">
              02 / ABOUT
            </span>

            <span className="home-section-rule" />

            <span className="home-section-caption">
              THE PIZZAGO WAY
            </span>
          </div>

          <div
            className="home-intro-content"
            data-reveal
          >
            <h2>
              Pizza doesn't need
              <br />
              to be <em>complicated.</em>
            </h2>

            <div className="home-intro-copy">
              <p>
                Start with quality ingredients. Add
                creativity. Bake with care.
              </p>

              <p>
                From classic favourites to completely
                customized creations, PizzaGo lets you
                make every order your own.
              </p>

              <Link
                to="/menu"
                className="home-text-link"
              >
                Discover our menu
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          POPULAR PIZZAS
      ========================================= */}

      <section className="home-menu-section">
        <div className="container">
          <div className="home-section-top">
            <span className="home-section-number">
              03 / MENU
            </span>

            <span className="home-section-rule" />

            <Link
              to="/menu"
              className="home-section-link"
            >
              View full menu
              <ArrowRight size={16} />
            </Link>
          </div>

          <div
            className="home-menu-heading"
            data-reveal
          >
            <div>
              <span>FROM OUR KITCHEN</span>

              <h2>
                Meet our
                <br />
                <em>favourites.</em>
              </h2>
            </div>

            <p>
              Some pizzas simply deserve
              <br />
              another bite.
            </p>
          </div>

          {loading ? (
            <div className="home-menu-loading">
              <div />
              <div />
              <div />
              <div />
            </div>
          ) : popularPizzas.length > 0 ? (
            <div className="home-pizza-grid">
              {popularPizzas.map((pizza, index) => (
                <Link
                  to={`/pizza/${pizza._id}`}
                  className="home-pizza-card"
                  key={pizza._id}
                  data-reveal
                  style={{
                    "--card-delay": `${index * 0.12}s`,
                  }}
                >
                  <div className="home-pizza-image">
                    <img
                      src={pizza.image}
                      alt={pizza.name}
                    />

                    <div className="home-pizza-number">
                      0{index + 1}
                    </div>

                    <div className="home-pizza-category">
                      {pizza.category === "Non-Veg"
                        ? "NON-VEG"
                        : "VEG"}
                    </div>

                    <div className="home-pizza-hover">
                      <span>VIEW</span>
                      <ArrowRight size={18} />
                    </div>
                  </div>

                  <div className="home-pizza-info">
                    <div>
                      <span>
                        {pizza.category}
                      </span>

                      <h3>{pizza.name}</h3>
                    </div>

                    <strong>
                      ₹{pizza.sizes?.small}
                    </strong>
                  </div>

                  <p>{pizza.description}</p>

                  <div className="home-pizza-link">
                    Customize
                    <ArrowRight size={15} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="home-menu-empty">
              No pizzas available right now.
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          LARGE SHOWCASE
      ========================================= */}

      <section className="home-showcase">
        <div className="container">
          <div className="home-section-top">
            <span className="home-section-number">
              04 / EXPERIENCE
            </span>

            <span className="home-section-rule" />

            <span className="home-section-caption">
              MADE TO ORDER
            </span>
          </div>

          <div className="home-showcase-layout">
            <div
              className="home-showcase-copy"
              data-reveal
            >
              <span className="home-eyebrow-small">
                YOUR PIZZA. YOUR RULES.
              </span>

              <h2>
                Make it
                <br />
                <em>yours.</em>
              </h2>

              <p>
                Choose your size, crust, sauce, toppings
                and cheese. Every pizza can be built
                exactly the way you want it.
              </p>

              <div className="home-showcase-features">
                <div>
                  <Check size={15} />
                  <span>Choose your size</span>
                </div>

                <div>
                  <Check size={15} />
                  <span>Pick your crust</span>
                </div>

                <div>
                  <Check size={15} />
                  <span>Add your toppings</span>
                </div>

                <div>
                  <Check size={15} />
                  <span>Extra cheese</span>
                </div>
              </div>

              <Link
                to={
                  showcasePizza
                    ? `/pizza/${showcasePizza._id}`
                    : "/menu"
                }
                className="home-dark-button"
              >
                Start customizing
                <ArrowRight size={17} />
              </Link>
            </div>

            <div
              className="home-showcase-visual"
              data-reveal
            >
              <div className="home-showcase-browser">
                <div className="home-browser-bar">
                  <div className="home-browser-dots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="home-browser-address">
                    pizzago.local / customize
                  </div>
                </div>

                <div className="home-browser-content">
                  {showcasePizza ? (
                    <img
                      src={showcasePizza.image}
                      alt={showcasePizza.name}
                    />
                  ) : (
                    <div>🍕</div>
                  )}

                  <div className="home-browser-overlay">
                    <span>
                      CUSTOMIZE YOUR PIZZA
                    </span>

                    <strong>
                      {showcasePizza?.name ||
                        "Your favourite"}
                    </strong>

                    <small>
                      Choose every detail.
                    </small>
                  </div>
                </div>
              </div>

              <div className="home-showcase-orbit">
                CUSTOMIZE
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          STATISTICS
      ========================================= */}

      <section className="home-stats-section">
        <div className="container">
          <div className="home-stats-heading" data-reveal>
            <span>WHY PIZZAGO</span>

            <h2>
              Simple.
              <br />
              <em>Good.</em>
              <br />
              Memorable.
            </h2>
          </div>

          <div className="home-stats-grid">
            <div
              className="home-stat"
              data-reveal
            >
              <strong>20+</strong>
              <span>Pizza varieties</span>
              <p>
                Classic favourites and bold new
                combinations.
              </p>
            </div>

            <div
              className="home-stat"
              data-reveal
            >
              <strong>30–40</strong>
              <span>Minutes</span>
              <p>
                Fresh pizza delivered hot to your door.
              </p>
            </div>

            <div
              className="home-stat"
              data-reveal
            >
              <strong>100%</strong>
              <span>Made fresh</span>
              <p>
                Every order is prepared when you order it.
              </p>
            </div>

            <div
              className="home-stat"
              data-reveal
            >
              <strong>∞</strong>
              <span>Your combinations</span>
              <p>
                Customize every pizza exactly your way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          PROCESS
      ========================================= */}

      <section className="home-process">
        <div className="container">
          <div className="home-section-top">
            <span className="home-section-number">
              05 / PROCESS
            </span>

            <span className="home-section-rule" />

            <span className="home-section-caption">
              HOW IT WORKS
            </span>
          </div>

          <div
            className="home-process-heading"
            data-reveal
          >
            <h2>
              From craving
              <br />
              to <em>doorstep.</em>
            </h2>
          </div>

          <div className="home-process-grid">
            <div className="home-process-item" data-reveal>
              <span>01</span>

              <div className="home-process-icon">
                <Leaf size={23} />
              </div>

              <h3>Choose</h3>

              <p>
                Pick your favourite pizza from our
                menu.
              </p>
            </div>

            <div className="home-process-item" data-reveal>
              <span>02</span>

              <div className="home-process-icon">
                <Sparkles size={23} />
              </div>

              <h3>Customize</h3>

              <p>
                Make every detail exactly the way you
                like it.
              </p>
            </div>

            <div className="home-process-item" data-reveal>
              <span>03</span>

              <div className="home-process-icon">
                <Clock3 size={23} />
              </div>

              <h3>We bake</h3>

              <p>
                Your pizza is freshly prepared just for
                your order.
              </p>
            </div>

            <div className="home-process-item" data-reveal>
              <span>04</span>

              <div className="home-process-icon">
                <Truck size={23} />
              </div>

              <h3>Enjoy</h3>

              <p>
                Hot, fresh pizza arrives at your
                doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          BRAND STORY
      ========================================= */}

      <section className="home-story">
        <div className="container">
          <div className="home-story-grid">
            <div
              className="home-story-image"
              data-reveal
            >
              {finalPizza ? (
                <img
                  src={finalPizza.image}
                  alt={finalPizza.name}
                />
              ) : (
                <div>🍕</div>
              )}

              <div className="home-story-stamp">
                <span>MADE</span>
                <strong>WITH</strong>
                <span>LOVE</span>
              </div>

              <div className="home-story-number">
                06
              </div>
            </div>

            <div
              className="home-story-content"
              data-reveal
            >
              <span className="home-eyebrow-small">
                THE PIZZAGO WAY
              </span>

              <h2>
                Good ingredients.
                <br />
                <em>Great pizza.</em>
              </h2>

              <p>
                We believe pizza should be simple,
                fresh and full of flavour.
              </p>

              <p>
                No unnecessary complexity. Just good
                ingredients, thoughtful combinations and
                a pizza made exactly how you want it.
              </p>

              <Link
                to="/menu"
                className="home-text-link"
              >
                Discover PizzaGo
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          TESTIMONIAL / SOCIAL PROOF
      ========================================= */}

      <section className="home-social">
        <div className="container">
          <div
            className="home-social-inner"
            data-reveal
          >
            <div className="home-social-icon">
              <Play size={18} />
            </div>

            <span className="home-eyebrow-small">
              PEOPLE LOVE PIZZA
            </span>

            <blockquote>
              “The best part is being able to build
              exactly the pizza I want.”
            </blockquote>

            <div className="home-social-person">
              <div className="home-social-avatar">
                P
              </div>

              <div>
                <strong>PizzaGo Customer</strong>
                <span>Verified order</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FINAL CTA
      ========================================= */}

      <section className="home-final">
        <div className="home-final-shape" />

        <div
          className="container home-final-inner"
          data-reveal
        >
          <span className="home-final-eyebrow">
            FRESH • HOT • DELICIOUS
          </span>

          <h2>
            What are you
            <br />
            <em>craving today?</em>
          </h2>

          <p>
            Your next favourite pizza is only a few
            clicks away.
          </p>

          <Link
            to="/menu"
            className="home-final-button"
          >
            Explore PizzaGo
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* =========================================
          MINI FOOTER
      ========================================= */}

      <footer className="home-footer">
        <div className="container home-footer-inner">
          <div className="home-footer-brand">
            <span className="home-footer-logo">
              🍕 PizzaGo
            </span>

            <p>
              Real pizza. Real happiness.
            </p>
          </div>

          <div className="home-footer-links">
            <Link to="/">Home</Link>
            <Link to="/menu">Menu</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/profile">Profile</Link>
          </div>

          <span className="home-footer-copy">
            © 2026 PizzaGo
          </span>
        </div>
      </footer>
    </main>
  );
}

export default Home;
