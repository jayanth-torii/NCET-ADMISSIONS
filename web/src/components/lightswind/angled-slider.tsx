"use client";

import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, animate, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface AngledSliderItem {
    id: string | number;
    url?: string;
    alt?: string;
    title?: string;
    content?: React.ReactNode;
}

interface AngledSliderProps {
    /**
     * Array of image objects, URLs, or custom content
     */
    items: AngledSliderItem[];
    renderItem?: (item: AngledSliderItem, index: number) => React.ReactNode;
    /**
     * Speed of auto-scroll (seconds for full loop). Higher is slower.
     * @default 20
     */
    speed?: number;
    /**
     * Direction of scroll
     * @default "left"
     */
    direction?: "left" | "right";
    /**
     * Height of the slider container
     * @default "400px"
     */
    containerHeight?: string;
    /**
     * Width of each card
     * @default "300px"
     */
    cardWidth?: string;
    /**
     * Gap between cards
     * @default "40px"
     */
    gap?: string;
    /**
     * Angle of the 3D skew/rotation
     * @default 20
     */
    angle?: number;
    /**
     * Scale on hover
     * @default 1.05
     */
    hoverScale?: number;
    className?: string;
}

const cardVariants: Variants = {
    offHover: (angle: number) => ({
        rotateY: angle,
        z: 60, // Ensure card is in front of container plane (which blocks -Z events)
        opacity: 0.9,
        scale: 1,
        zIndex: 30, // Higher than potential overlays
        transition: {
            type: "spring",
            mass: 3,
            stiffness: 400,
            damping: 50
        }
    }),
    onHover: (hoverScale: number) => ({
        rotateY: 0,
        z: 120, // Pop out further
        opacity: 1,
        scale: hoverScale,
        zIndex: 50,
        transition: {
            type: "spring",
            mass: 3,
            stiffness: 400,
            damping: 50
        }
    })
};

const AngledCard = ({
    item,
    angle,
    hoverScale,
    cardWidth,
    renderItem,
    index,
}: {
    item: AngledSliderItem;
    angle: number;
    hoverScale: number;
    cardWidth: string;
    renderItem?: (item: AngledSliderItem, index: number) => React.ReactNode;
    index: number;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className="relative flex-shrink-0 group overflow-visible cursor-pointer select-none py-10"
            style={{
                width: cardWidth,
                transformStyle: "preserve-3d",
            }}
            custom={isHovered ? hoverScale : angle}
            variants={cardVariants}
            initial="offHover"
            animate={isHovered ? "onHover" : "offHover"}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative h-full w-full [transform-style:preserve-3d]">
                {renderItem ? (
                    renderItem(item, index)
                ) : item.content ? (
                    item.content
                ) : (
                    /* The Image Card */
                    <div className="relative h-full w-full overflow-hidden border border-navy-100/50 bg-white rounded-2xl min-h-[360px] shadow-2xl">
                        {item.url && (
                            <Image
                                src={item.url}
                                alt={item.alt || "Slider Image"}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        )}
                        {/* Optional Overlay/Title */}
                        {item.title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <h3 className="text-lg font-bold">{item.title}</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export const AngledSlider = ({
    items,
    renderItem,
    speed = 40,
    direction = "left",
    containerHeight = "400px",
    cardWidth = "300px",
    gap = "40px",
    angle = 20,
    hoverScale = 1.05,
    className,
}: AngledSliderProps) => {
    const [width, setWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const [isHovered, setIsHovered] = useState(false);

    // Duplicate items for infinite loop effect
    // If fewer than 4 items, duplicate just enough or display neatly without awkward stutter
    const duplicatedItems = items.length <= 2 
        ? [...items, ...items, ...items, ...items] 
        : [...items, ...items, ...items];

    const [effectiveWidth, setEffectiveWidth] = useState(cardWidth);

    useEffect(() => {
        const updateDimensions = () => {
            const screenW = window.innerWidth;
            const isSmallMobile = screenW < 480;
            const isMobile = screenW < 640;
            const isTablet = screenW < 1024;
            
            // On mobile view, size card so 1 card is prominently shown at a time
            let currentCardW = cardWidth;
            if (isSmallMobile) {
                currentCardW = `${Math.min(screenW - 48, 300)}px`;
            } else if (isMobile) {
                currentCardW = "310px";
            } else if (isTablet) {
                currentCardW = "330px";
            }
            setEffectiveWidth(currentCardW);

            const numWidth = parseInt(currentCardW.replace("px", "") || "300");
            const numGap = parseInt(gap?.toString().replace("px", "") || "40");

            if (!isNaN(numWidth) && !isNaN(numGap)) {
                const calculatedWidth = (numWidth + numGap) * items.length;
                setWidth(calculatedWidth);
            } else if (containerRef.current) {
                const scrollWidth = containerRef.current.scrollWidth;
                setWidth(scrollWidth / 3);
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [items, cardWidth, gap]);

    useEffect(() => {
        if (width <= 0) return;

        const startX = direction === "left" ? 0 : -width;
        const endX = direction === "left" ? -width : 0;

        if (isHovered) return;

        const runAnimation = () => {
            const currentX = x.get();
            const totalDist = width;
            const dist = Math.abs(endX - currentX);
            const duration = speed * (dist / totalDist);

            const controls = animate(x, endX, {
                duration: duration,
                ease: "linear",
                onComplete: () => {
                    x.set(startX);
                    runAnimation();
                }
            });
            return controls;
        };

        const animation = runAnimation();

        return () => {
            animation.stop();
        };
    }, [width, speed, direction, isHovered, x]);

    return (
        <div
            className={cn(
                "relative w-full overflow-hidden bg-transparent py-4 sm:py-6 perspective-1000",
                className
            )}
            style={{
                height: containerHeight,
                perspective: "1000px", // Essential for 3D effect
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                ref={containerRef}
                className="flex items-center"
                style={{ x, gap, transformStyle: "preserve-3d" }}
            >
                {duplicatedItems.map((item, index) => (
                    <AngledCard
                        key={`${item.id}-${index}`}
                        item={item}
                        angle={angle}
                        hoverScale={hoverScale}
                        cardWidth={effectiveWidth}
                        renderItem={renderItem}
                        index={index}
                    />
                ))}
            </motion.div>
        </div>
    );
};
