import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import './Carousel.css';

const DEFAULT_ITEMS = [];
const DRAG_BUFFER = 50;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

function CarouselItem({ item, index, itemWidth, round, trackItemOffset, x, transition }) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });
  const zIndex = useTransform(x, range, [0, 100, 0], { clamp: true });

  return (
    <motion.div
      key={index}
      className={`carousel-item ${round ? 'round' : ''}`}
      style={{
        width: itemWidth,
        height: '100%',
        rotateY: rotateY,
        zIndex: zIndex,
        ...(round && { borderRadius: '50%' }),
        // Remove default styles if it's an image card
        background: item.imgUrl ? 'transparent' : undefined,
        border: item.imgUrl ? 'none' : undefined,
      }}
      transition={transition}
    >
      {/* FIX: Check if 'imgUrl' exists. 
         If YES -> Render your Skill Icon. 
         If NO -> Render the default text card.
      */}
      {item.imgUrl ? (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0716',   // Card background
          border: '1px solid #333',
          borderRadius: '20px',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <img 
            src={item.imgUrl} 
            alt={item.altText} 
            style={{ 
              width: '60%', 
              height: '60%', 
              objectFit: 'contain', 
              marginBottom: '10px',
              filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' 
            }} 
            draggable={false} 
          />
          <h5 style={{ color: '#fff', margin: 0, fontSize: '1rem' }}>{item.altText}</h5>
        </div>
      ) : (
        /* Default Text Card Layout */
        <>
          <div className="carousel-item-header">
            <span className="carousel-icon-container">{item.icon}</span>
          </div>
          <div className="carousel-item-content">
            <div className="carousel-item-title">{item.title}</div>
            <p className="carousel-item-description">{item.description}</p>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false
}) {
  const containerPadding = 16;
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;
  
  const itemsForRender = useMemo(() => {
    if (!loop) return items;
    if (items.length === 0) return [];
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const [position, setPosition] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return;
    if (pauseOnHover && isHovered) return;

    const timer = setInterval(() => {
      setPosition(prev => prev + 1);
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

  useEffect(() => {
    if (isJumping) return;
    x.set(-(position * trackItemOffset));
  }, [position, trackItemOffset, isJumping, x]);

  const effectiveTransition = isJumping ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationStart = () => setIsAnimating(true);

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    if (!loop || itemsForRender.length <= 1) return;

    if (position >= itemsForRender.length - 1) {
      setIsJumping(true);
      setPosition(1);
      requestAnimationFrame(() => setIsJumping(false));
    } else if (position <= 0) {
      setIsJumping(true);
      setPosition(itemsForRender.length - 2);
      requestAnimationFrame(() => setIsJumping(false));
    }
  };

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const direction = offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD ? 1 : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD ? -1 : 0;
    
    if (direction === 0) {
      x.set(-(position * trackItemOffset));
      return;
    }
    setPosition(prev => prev + direction);
  };

  return (
    <div
      ref={containerRef}
      className={`carousel-container ${round ? 'round' : ''}`}
      style={{
        width: `${baseWidth}px`,
        height: `${baseWidth}px`,
        ...(round && { borderRadius: '50%' })
      }}
    >
      <motion.div
        className="carousel-track"
        drag="x"
        dragConstraints={{
            left: -trackItemOffset * (itemsForRender.length - 1),
            right: 0
        }}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={index}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={round}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>
    </div>
  );
}