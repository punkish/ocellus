/**
 * [claude] Animated accordion (collapsible details element).
 *
 * Uses the Web Animations API to smoothly expand and collapse
 * <details> elements with a sliding height animation.
 * https://css-tricks.com/how-to-animate-the-details-element/
 */

/**
 * [claude] Manages smooth open/close animations for a single
 * <details> element. Animates the element's height between its
 * collapsed (summary-only) and expanded (summary + content)
 * states.
 *
 * @class Accordion
 * @param {Element} el - The <details> element to animate
 */
class Accordion {

    constructor(el) {

        // [claude] The <details> container
        this.el = el;

        // [claude] The <summary> (always visible header)
        this.summary = el.querySelector('summary');

        // [claude] The collapsible content wrapper
        this.content = el.querySelector('#charts');

        // [claude] Handle to the currently-running animation
        this.animation = null;

        // [claude] Flags to track animation state
        this.isClosing = false;
        this.isExpanding = false;

        // [claude] Detect user interaction
        this.summary.addEventListener('click', (e) => this.onClick(e));
    }

    /**
     * [claude] Click handler: toggle between open and closed
     * states.
     * @param {MouseEvent} e
     */
    onClick(e) {
        e.preventDefault();

        this.el.style.overflow = 'hidden';

        if (this.isClosing || !this.el.open) {
            this.open();
        }
        else if (this.isExpanding || this.el.open) {
            this.shrink();
        }
    }

    /**
     * [claude] Shrinks the details element from expanded to
     * collapsed height.
     */
    shrink() {
        this.isClosing = true;
        const startHeight = `${this.el.offsetHeight}px`;
        const endHeight = `${this.summary.offsetHeight}px`;
        if (this.animation) this.animation.cancel();

        this.animation = this.el.animate({
            height: [startHeight, endHeight]
        }, {
            duration: 400,
            easing: 'ease-out'
        });

        this.animation.onfinish = () => this.onAnimationFinish(false);
        this.animation.oncancel = () => this.isClosing = false;
    }

    /**
     * [claude] Expands the details element from collapsed to
     * expanded height. Schedules the height calculation to occur
     * after the [open] attribute is set.
     */
    open() {
        this.el.style.height = `${this.el.offsetHeight}px`;
        this.el.open = true;
        window.requestAnimationFrame(() => this.expand());
    }

    /**
     * [claude] Calculates and animates to the full expanded height
     * (summary + content).
     */
    expand() {
        this.isExpanding = true;
        const startHeight = `${this.el.offsetHeight}px`;

        const endHeight = `${
            this.summary.offsetHeight +
            this.content.offsetHeight
        }px`;

        if (this.animation) this.animation.cancel();

        this.animation = this.el.animate({
            height: [startHeight, endHeight]
        }, {
            duration: 400,
            easing:   'ease-out'
        });

        this.animation.onfinish = () => this.onAnimationFinish(true);
        this.animation.oncancel = () => this.isExpanding = false;
    }

    /**
     * [claude] Cleanup after animation completes: removes fixed
     * height and overflow styles, resets animation tracking.
     * @param {boolean} open - Final state of the element
     */
    onAnimationFinish(open) {
        this.el.open = open;
        this.animation = null;
        this.isClosing = false;
        this.isExpanding = false;
        this.el.style.height = this.el.style.overflow = '';
    }
}

export { Accordion };
