
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    /**
     * Hot module replacement for Svelte in the Wild
     *
     * @export
     * @param {object} Component Svelte component
     * @param {object} [options={ target: document.body }] Options for the Svelte component
     * @param {string} [id='hmr'] ID for the component container
     * @param {string} [eventName='app-loaded'] Name of the event that triggers replacement of previous component
     * @returns
     */
    function HMR(Component, options = { target: document.body }, id = 'hmr', eventName = 'app-loaded') {
        const oldContainer = document.getElementById(id);

        // Create the new (temporarily hidden) component container
        const appContainer = document.createElement("div");
        if (oldContainer) appContainer.style.visibility = 'hidden';
        else appContainer.setAttribute('id', id); //ssr doesn't get an event, so we set the id now

        // Attach it to the target element
        options.target.appendChild(appContainer);

        // Wait for the app to load before replacing the component
        addEventListener(eventName, replaceComponent);

        function replaceComponent() {
            if (oldContainer) oldContainer.remove();
            // Show our component and take over the ID of the old container
            appContainer.style.visibility = 'initial';
            // delete (appContainer.style.visibility)
            appContainer.setAttribute('id', id);
        }

        return new Component({
            ...options,
            target: appContainer
        });
    }

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j];
                    if (attributes[attribute.name]) {
                        j++;
                    }
                    else {
                        node.removeAttribute(attribute.name);
                    }
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    function query_selector_all(selector, parent = document.body) {
        return Array.from(parent.querySelectorAll(selector));
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const route = writable({});
    const routes = writable([]);

    const beforeUrlChange = {
      _hooks: [],
      subscribe(listener) {
        const hooks = this._hooks;
        const index = hooks.length;
        listener(callback => { hooks[index] = callback; });
        return () => delete hooks[index]
      }
    };

    /** HELPERS */
    const url = {
      subscribe(listener) {
        return derived(getContext('routify'), context => context.url).subscribe(
          listener
        )
      },
    };

    const isActive = {
      subscribe(listener) {
        return derived(
          getContext('routify'),
          context => context.isActive
        ).subscribe(listener)
      },
    };

    function _isActive(url, route) {
      return function (path, keepIndex = true) {
        path = url(path, null, keepIndex);
        const currentPath = url(route.path, null, keepIndex);
        const re = new RegExp('^' + path);
        return currentPath.match(re)
      }
    }

    function _goto(url) {
      return function goto(path, params, _static, shallow) {
        const href = url(path, params);
        if (!_static) history.pushState({}, null, href);
        else getContext('routifyupdatepage')(href, shallow);
      }
    }

    function _url(context, route, routes) {
      return function url(path, params, preserveIndex) {
        path = path || './';

        if (!preserveIndex) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          // get component's dir
          let dir = context.path;
          // traverse through parents if needed
          const traverse = path.match(/\.\.\//g) || [];
          traverse.forEach(() => {
            dir = dir.replace(/\/[^\/]+\/?$/, '');
          });

          // strip leading periods and slashes
          path = path.replace(/^[\.\/]+/, '');
          dir = dir.replace(/\/$/, '') + '/';
          path = dir + path;
        } else if (path.match(/^\//)) ; else {
          // NAMED PATH
          const matchingRoute = routes.find(route => route.meta.name === path);
          if (matchingRoute) path = matchingRoute.shortPath;
        }

        params = Object.assign({}, route.params, context.params, params);
        for (const [key, value] of Object.entries(params)) {
          path = path.replace(`:${key}`, value);
        }
        return path
      }
    }


    const _meta = {
      props: {},
      templates: {},
      services: {
        plain: { propField: 'name', valueField: 'content' },
        twitter: { propField: 'name', valueField: 'content' },
        og: { propField: 'property', valueField: 'content' },
      },
      plugins: [
        {
          name: 'applyTemplate',
          condition: () => true,
          action: (prop, value) => {
            const template = _meta.getLongest(_meta.templates, prop) || (x => x);
            return [prop, template(value)]
          }
        },
        {
          name: 'createMeta',
          condition: () => true,
          action(prop, value) {
            _meta.writeMeta(prop, value);
          }
        },
        {
          name: 'createOG',
          condition: prop => !prop.match(':'),
          action(prop, value) {
            _meta.writeMeta(`og:${prop}`, value);
          }
        },
        {
          name: 'createTitle',
          condition: prop => prop === 'title',
          action(prop, value) {
            document.title = value;
          }
        }
      ],
      getLongest(repo, name) {
        const providers = repo[name];
        if (providers) {
          const currentPath = get_store_value(route).path;
          const allPaths = Object.keys(repo[name]);
          const matchingPaths = allPaths.filter(path => currentPath.includes(path));

          const longestKey = matchingPaths.sort((a, b) => b.length - a.length)[0];

          return providers[longestKey]
        }
      },
      writeMeta(prop, value) {
        const head = document.getElementsByTagName('head')[0];
        const match = prop.match(/(.+)\:/);
        const serviceName = match && match[1] || 'plain';
        const { propField, valueField } = meta.services[serviceName] || meta.services.plain;
        const oldElement = document.querySelector(`meta[${propField}='${prop}']`);
        if (oldElement) oldElement.remove();

        const newElement = document.createElement('meta');
        newElement.setAttribute(propField, prop);
        newElement.setAttribute(valueField, value);
        newElement.setAttribute('data-origin', 'routify');
        head.appendChild(newElement);
      },
      set(prop, value) {
        _meta.plugins.forEach(plugin => {
          if (plugin.condition(prop, value))
            [prop, value] = plugin.action(prop, value) || [prop, value];
        });
      },
      clear() {
        const oldElement = document.querySelector(`meta`);
        if (oldElement) oldElement.remove();
      },
      template(name, fn) {
        const origin = _meta.getOrigin();
        _meta.templates[name] = _meta.templates[name] || {};
        _meta.templates[name][origin] = fn;
      },
      update() {
        Object.keys(_meta.props).forEach((prop) => {
          let value = (_meta.getLongest(_meta.props, prop));
          _meta.plugins.forEach(plugin => {
            if (plugin.condition(prop, value)) {
              [prop, value] = plugin.action(prop, value) || [prop, value];

            }
          });
        });
      },
      batchedUpdate() {
        if (!_meta._pendingUpdate) {
          _meta._pendingUpdate = true;
          setTimeout(() => {
            _meta._pendingUpdate = false;
            this.update();
          });
        }
      },
      _updateQueued: false,
      getOrigin() {
        const routifyCtx = getContext('routify');
        return routifyCtx && get_store_value(routifyCtx).path || '/'
      },
      _pendingUpdate: false
    };

    const meta = new Proxy(_meta, {
      set(target, name, value, receiver) {
        const { props, getOrigin } = target;

        if (Reflect.has(target, name))
          Reflect.set(target, name, value, receiver);
        else {
          props[name] = props[name] || {};
          props[name][getOrigin()] = value;
        }
        
        if (window.routify.appLoaded)
          target.batchedUpdate();
        return true
      }
    });

    var config = {
      "pages": "/Users/varvanin/ikph-svelte/src/pages",
      "sourceDir": "src",
      "routifyDir": "node_modules/@sveltech/routify/tmp",
      "ignore": [],
      "unknownPropWarnings": true,
      "dynamicImports": false,
      "singleBuild": false,
      "scroll": "smooth",
      "extensions": [
        "html",
        "svelte",
        "md"
      ],
      "distDir": "dist",
      "noPrerender": false,
      "ssr": false,
      "prerender": true,
      "staticDir": "static",
      "scriptsDir": "scripts",
      "childProcess": "rollup -c -w",
      "unusedPropWarnings": true
    };

    const MATCH_PARAM = RegExp(/\:[^\/\()]+/g);

    function handleScroll(element) {
      scrollAncestorsToTop(element);
      handleHash();
    }

    function handleHash() {
      const { scroll } = config;
      const options = ['auto', 'smooth'];
      const { hash } = window.location;
      if (scroll && hash) {
        const behavior = (options.includes(scroll) && scroll) || 'auto';
        const el = document.querySelector(hash);
        if (hash && el) el.scrollIntoView({ behavior });
      }
    }

    function scrollAncestorsToTop(element) {
      if (
        element &&
        element.scrollTo &&
        element.dataset.routify !== 'scroll-lock'
      ) {
        element.scrollTo(0, 0);
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = '^' + str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParams = string => {
      const matches = string.match(MATCH_PARAM);
      if (matches) return matches.map(str => str.substr(1, str.length - 2))
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/')
        .filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    let warningSuppressed = false;

    /* eslint no-console: 0 */
    function suppressWarnings() {
      if (warningSuppressed) return
      const consoleWarn = console.warn;
      console.warn = function(msg, ...msgs) {
        const ignores = [
          "was created with unknown prop 'scoped'",
          "was created with unknown prop 'scopedSync'",
        ];
        if (!ignores.find(iMsg => msg.includes(iMsg)))
          return consoleWarn(msg, ...msgs)
      };
      warningSuppressed = true;
    }

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.19.2 */
    const file = "node_modules/@sveltech/routify/runtime/Route.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	return child_ctx;
    }

    // (87:0) {#if component}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*remainingLayouts*/ ctx[8].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(87:0) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (104:2) {:else}
    function create_else_block(ctx) {
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[5] },
    		/*propFromParam*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[7];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, propFromParam*/ 41)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 32 && { scopedSync: /*scopedSync*/ ctx[5] },
    					dirty & /*propFromParam*/ 8 && get_spread_object(/*propFromParam*/ ctx[3])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(104:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (88:2) {#if remainingLayouts.length}
    function create_if_block_2(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let current;
    	let each_value = [0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*key*/ ctx[4];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < 1; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*component, scoped, scopedSync, propFromParam, remainingLayouts, decorator, Decorator, isDecorator, scopeToChild*/ 134219243) {
    				const each_value = [0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block, each_1_anchor, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < 1; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 1; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < 1; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(88:2) {#if remainingLayouts.length}",
    		ctx
    	});

    	return block;
    }

    // (90:6) <svelte:component         this={component}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...propFromParam}>
    function create_default_slot(ctx) {
    	let t;
    	let current;

    	const route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[8]],
    				Decorator: typeof /*decorator*/ ctx[27] !== "undefined"
    				? /*decorator*/ ctx[27]
    				: /*Decorator*/ ctx[1],
    				childOfDecorator: /*isDecorator*/ ctx[6],
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[10]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    			t = space();
    		},
    		l: function claim(nodes) {
    			claim_component(route_1.$$.fragment, nodes);
    			t = claim_space(nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 256) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[8]];

    			if (dirty & /*decorator, Decorator*/ 134217730) route_1_changes.Decorator = typeof /*decorator*/ ctx[27] !== "undefined"
    			? /*decorator*/ ctx[27]
    			: /*Decorator*/ ctx[1];

    			if (dirty & /*isDecorator*/ 64) route_1_changes.childOfDecorator = /*isDecorator*/ ctx[6];

    			if (dirty & /*scoped, scopeToChild*/ 1025) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[10]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(90:6) <svelte:component         this={component}         let:scoped={scopeToChild}         let:decorator         {scoped}         {scopedSync}         {...propFromParam}>",
    		ctx
    	});

    	return block;
    }

    // (89:4) {#each [0] as dummy (key)}
    function create_each_block(key_2, ctx) {
    	let first;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ scoped: /*scoped*/ ctx[0] },
    		{ scopedSync: /*scopedSync*/ ctx[5] },
    		/*propFromParam*/ ctx[3]
    	];

    	var switch_value = /*component*/ ctx[7];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot,
    					({ scoped: scopeToChild, decorator }) => ({ 10: scopeToChild, 27: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 1024 : 0) | (decorator ? 134217728 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		key: key_2,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			first = empty();
    			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
    			switch_instance_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, scopedSync, propFromParam*/ 41)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*scopedSync*/ 32 && { scopedSync: /*scopedSync*/ ctx[5] },
    					dirty & /*propFromParam*/ 8 && get_spread_object(/*propFromParam*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, Decorator, isDecorator, scoped, scopeToChild*/ 402654531) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[7])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(89:4) {#each [0] as dummy (key)}",
    		ctx
    	});

    	return block;
    }

    // (116:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			this.h();
    		},
    		l: function claim(nodes) {
    			span = claim_element(nodes, "SPAN", {});
    			children(span).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(span, file, 116, 2, 2973);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			dispose = action_destroyer(setParent_action = /*setParent*/ ctx[9].call(null, span));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(116:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*component*/ ctx[7] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block0) if_block0.l(nodes);
    			t = claim_space(nodes);
    			if (if_block1) if_block1.l(nodes);
    			if_block1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*component*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[2]) {
    				if (!if_block1) {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    async function onAppLoaded() {
    	// Let every know the last child has rendered
    	if (!window.routify.stopAutoReady) {
    		dispatchEvent(new CustomEvent("app-loaded"));
    		window.routify.appLoaded = true;
    	}
    }

    function instance($$self, $$props, $$invalidate) {
    	let $route;
    	let $routes;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(17, $route = $$value));
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, $$value => $$invalidate(18, $routes = $$value));

    	let { layouts = [] } = $$props,
    		{ scoped = {} } = $$props,
    		{ Decorator = undefined } = $$props,
    		{ childOfDecorator = false } = $$props;

    	let scopeToChild,
    		props = {},
    		parentElement,
    		propFromParam = {},
    		key = 0,
    		scopedSync = {},
    		isDecorator = false;

    	const context = writable({});
    	setContext("routify", context);

    	function setParent(el) {
    		$$invalidate(2, parentElement = el.parentElement);
    	}

    	let _lastLayout, _Component;

    	function onComponentLoaded() {
    		$$invalidate(13, _lastLayout = layout);
    		if (layoutIsUpdated) $$invalidate(4, key++, key);
    		if (remainingLayouts.length === 0) onLastComponentLoaded();
    		const url = _url(layout, $route, $routes);

    		context.set({
    			route: $route,
    			path: layout.path,
    			url,
    			goto: _goto(url),
    			isActive: _isActive(url, $route)
    		});
    	}

    	let component;

    	function setComponent(layout) {
    		if (layoutIsUpdated) _Component = layout.component();

    		if (_Component.then) _Component.then(res => {
    			$$invalidate(7, component = res);
    			$$invalidate(5, scopedSync = { ...scoped });
    			onComponentLoaded();
    		}); else {
    			$$invalidate(7, component = _Component);
    			$$invalidate(5, scopedSync = { ...scoped });
    			onComponentLoaded();
    		}
    	}

    	async function onLastComponentLoaded() {
    		await tick();
    		handleScroll(parentElement);
    		meta.update();
    		if (!window.routify.appLoaded) onAppLoaded();
    	}

    	const writable_props = ["layouts", "scoped", "Decorator", "childOfDecorator"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, []);

    	$$self.$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(11, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(12, childOfDecorator = $$props.childOfDecorator);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onDestroy,
    		onMount,
    		tick,
    		writable,
    		_url,
    		_goto,
    		_isActive,
    		meta,
    		route,
    		routes,
    		handleScroll,
    		layouts,
    		scoped,
    		Decorator,
    		childOfDecorator,
    		scopeToChild,
    		props,
    		parentElement,
    		propFromParam,
    		key,
    		scopedSync,
    		isDecorator,
    		context,
    		setParent,
    		_lastLayout,
    		_Component,
    		onComponentLoaded,
    		component,
    		setComponent,
    		onLastComponentLoaded,
    		onAppLoaded,
    		layout,
    		remainingLayouts,
    		layoutIsUpdated,
    		$route,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(11, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(1, Decorator = $$props.Decorator);
    		if ("childOfDecorator" in $$props) $$invalidate(12, childOfDecorator = $$props.childOfDecorator);
    		if ("scopeToChild" in $$props) $$invalidate(10, scopeToChild = $$props.scopeToChild);
    		if ("props" in $$props) props = $$props.props;
    		if ("parentElement" in $$props) $$invalidate(2, parentElement = $$props.parentElement);
    		if ("propFromParam" in $$props) $$invalidate(3, propFromParam = $$props.propFromParam);
    		if ("key" in $$props) $$invalidate(4, key = $$props.key);
    		if ("scopedSync" in $$props) $$invalidate(5, scopedSync = $$props.scopedSync);
    		if ("isDecorator" in $$props) $$invalidate(6, isDecorator = $$props.isDecorator);
    		if ("_lastLayout" in $$props) $$invalidate(13, _lastLayout = $$props._lastLayout);
    		if ("_Component" in $$props) _Component = $$props._Component;
    		if ("component" in $$props) $$invalidate(7, component = $$props.component);
    		if ("layout" in $$props) $$invalidate(15, layout = $$props.layout);
    		if ("remainingLayouts" in $$props) $$invalidate(8, remainingLayouts = $$props.remainingLayouts);
    		if ("layoutIsUpdated" in $$props) layoutIsUpdated = $$props.layoutIsUpdated;
    	};

    	let layout;
    	let remainingLayouts;
    	let layoutIsUpdated;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*Decorator, childOfDecorator, layouts*/ 6146) {
    			 if (Decorator && !childOfDecorator) {
    				$$invalidate(6, isDecorator = true);

    				$$invalidate(11, layouts = [
    					{
    						component: () => Decorator,
    						path: layouts[0].path + "__decorator"
    					},
    					...layouts
    				]);
    			}
    		}

    		if ($$self.$$.dirty & /*layouts*/ 2048) {
    			 $$invalidate(15, [layout, ...remainingLayouts] = layouts, layout, ((($$invalidate(8, remainingLayouts), $$invalidate(11, layouts)), $$invalidate(1, Decorator)), $$invalidate(12, childOfDecorator)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 32768) {
    			 if (layout && layout.param) $$invalidate(3, propFromParam = layout.param);
    		}

    		if ($$self.$$.dirty & /*_lastLayout, layout*/ 40960) {
    			 layoutIsUpdated = !_lastLayout || _lastLayout.path !== layout.path;
    		}

    		if ($$self.$$.dirty & /*layout*/ 32768) {
    			 setComponent(layout);
    		}
    	};

    	return [
    		scoped,
    		Decorator,
    		parentElement,
    		propFromParam,
    		key,
    		scopedSync,
    		isDecorator,
    		component,
    		remainingLayouts,
    		setParent,
    		scopeToChild,
    		layouts,
    		childOfDecorator
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			layouts: 11,
    			scoped: 0,
    			Decorator: 1,
    			childOfDecorator: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get childOfDecorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set childOfDecorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const { _hooks } = beforeUrlChange;

    function init$1(routes, callback) {
      let prevRoute = false;

      function updatePage(url, shallow) {
        const currentUrl = window.location.pathname;
        url = url || currentUrl;

        const route$1 = urlToRoute(url, routes);
        const currentRoute = shallow && urlToRoute(currentUrl, routes);
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        delete prevRoute.prev;
        route$1.prev = prevRoute;
        prevRoute = route$1;

        //set the route in the store
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      const destroy = createEventListeners(updatePage);

      return { updatePage, destroy }
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = async function (state, title, url) {
          const event = new Event(eventName.toLowerCase());
          Object.assign(event, { state, title, url });

          if (await runHooksBeforeUrlChange(event)) {
            fn.apply(this, [state, title, url]);
            return dispatchEvent(event)
          }
        };
      });

      let _ignoreNextPop = false;

      const listeners = {
        click: handleClick,
        pushstate: () => updatePage(),
        replacestate: () => updatePage(),
        popstate: async event => {
          if (_ignoreNextPop)
            _ignoreNextPop = false;
          else {
            if (await runHooksBeforeUrlChange(event)) {
              updatePage();
            } else {
              _ignoreNextPop = true;
              event.preventDefault();
              history.go(1);
            }
          }
        },
      };

      Object.entries(listeners).forEach(args => addEventListener(...args));

      const unregister = () => {
        Object.entries(listeners).forEach(args => removeEventListener(...args));
      };

      return unregister
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    async function runHooksBeforeUrlChange(event) {
      const route$1 = get_store_value(route);
      for (const hook of _hooks.filter(Boolean)) {
        // return false if the hook returns false
        if (await !hook(event, route$1)) return false
      }
      return true
    }

    function urlToRoute(url, routes) {
      const mockUrl = new URL(location).searchParams.get('__mock-url');
      url = mockUrl || url;

      const route = routes.find(route => url.match(route.regex));
      if (!route)
        throw new Error(
          `Route could not be found. Make sure ${url}.svelte or ${url}/index.svelte exists. A restart may be required.`
        )

      if (route.paramKeys) {
        const layouts = layoutByPos(route.layouts);
        const fragments = url.split('/').filter(Boolean);
        const routeProps = getRouteProps(route.path);

        routeProps.forEach((prop, i) => {
          if (prop) {
            route.params[prop] = fragments[i];
            if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
            else route.param = { [prop]: fragments[i] };
          }
        });
      }

      route.leftover = url.replace(new RegExp(route.regex), '');

      return route
    }

    function layoutByPos(layouts) {
      const arr = [];
      layouts.forEach(layout => {
        arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
      });
      return arr
    }

    function getRouteProps(url) {
      return url
        .split('/')
        .filter(Boolean)
        .map(f => f.match(/\:(.+)/))
        .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.19.2 */

    // (43:0) {#if layouts}
    function create_if_block$1(ctx) {
    	let current;

    	const route = new Route({
    			props: { layouts: /*layouts*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(route.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_changes = {};
    			if (dirty & /*layouts*/ 1) route_changes.layouts = /*layouts*/ ctx[0];
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(43:0) {#if layouts}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*layouts*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*layouts*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { routes: routes$1 } = $$props;
    	let layouts;
    	let navigator;
    	suppressWarnings();

    	if (!window.routify) {
    		window.routify = {};
    	}

    	const updatePage = (...args) => navigator && navigator.updatePage(...args);
    	setContext("routifyupdatepage", updatePage);
    	const callback = res => $$invalidate(0, layouts = res);

    	const cleanup = () => {
    		if (!navigator) return;
    		navigator.destroy();
    		navigator = null;
    	};

    	const doInit = () => {
    		cleanup();
    		navigator = init$1(routes$1, callback);
    		routes.set(routes$1);
    		navigator.updatePage();
    	};

    	onDestroy(cleanup);
    	const writable_props = ["routes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes$1 = $$props.routes);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		onDestroy,
    		Route,
    		init: init$1,
    		routesStore: routes,
    		suppressWarnings,
    		routes: routes$1,
    		layouts,
    		navigator,
    		updatePage,
    		callback,
    		cleanup,
    		doInit
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes$1 = $$props.routes);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    		if ("navigator" in $$props) navigator = $$props.navigator;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*routes*/ 2) {
    			 if (routes$1) doInit();
    		}
    	};

    	return [layouts, routes$1];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { routes: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[1] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function buildRoutes(routes, routeKeys) {
      return (
        routes
          // .map(sr => deserializeRoute(sr, routeKeys))
          .map(decorateRoute)
          .sort((c, p) => (c.ranking >= p.ranking ? -1 : 1))
      )
    }

    const decorateRoute = function(route) {
      route.paramKeys = pathToParams(route.path);
      route.regex = pathToRegex(route.path, route.isFallback);
      route.name = route.path.match(/[^\/]*\/[^\/]+$/)[0].replace(/[^\w\/]/g, ''); //last dir and name, then replace all but \w and /
      route.ranking = pathToRank(route);
      route.layouts.map(l => {
        l.param = {};
        return l
      });
      route.params = {};

      return route
    };

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/pages/components/PageTransitions.svelte generated by Svelte v3.19.2 */
    const file$1 = "src/pages/components/PageTransitions.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", {});
    			var div_nodes = children(div);
    			if (default_slot) default_slot.l(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			add_location(div, file$1, 4, 0, 64);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 1) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { delay: 50, duration: 150 }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { delay: 50, duration: 150 }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageTransitions> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PageTransitions", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ fade });
    	return [$$scope, $$slots];
    }

    class PageTransitions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageTransitions",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/pages/components/Header.svelte generated by Svelte v3.19.2 */
    const file$2 = "src/pages/components/Header.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i][0];
    	child_ctx[7] = list[i][1];
    	return child_ctx;
    }

    // (207:8) {#each links as [path, name]}
    function create_each_block$1(ctx) {
    	let li;
    	let a;
    	let t0_value = /*name*/ ctx[7] + "";
    	let t0;
    	let a_href_value;
    	let t1;

    	const block = {
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			var li_nodes = children(li);
    			a = claim_element(li_nodes, "A", { href: true, class: true });
    			var a_nodes = children(a);
    			t0 = claim_text(a_nodes, t0_value);
    			a_nodes.forEach(detach_dev);
    			t1 = claim_space(li_nodes);
    			li_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[1](/*path*/ ctx[6]));
    			attr_dev(a, "class", "svelte-1jwca59");
    			toggle_class(a, "active", /*$isActive*/ ctx[2](/*path*/ ctx[6]));
    			add_location(a, file$2, 208, 12, 3620);
    			attr_dev(li, "class", "svelte-1jwca59");
    			add_location(li, file$2, 207, 10, 3603);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t0);
    			append_dev(li, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$url*/ 2 && a_href_value !== (a_href_value = /*$url*/ ctx[1](/*path*/ ctx[6]))) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*$isActive, links*/ 12) {
    				toggle_class(a, "active", /*$isActive*/ ctx[2](/*path*/ ctx[6]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(207:8) {#each links as [path, name]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let div0;
    	let a;
    	let img;
    	let img_src_value;
    	let t0;
    	let nav;
    	let div3;
    	let div2;
    	let div1;
    	let div2_class_value;
    	let t1;
    	let ul;
    	let ul_class_value;
    	let dispose;
    	let each_value = /*links*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			a = element("a");
    			img = element("img");
    			t0 = space();
    			nav = element("nav");
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			this.h();
    		},
    		l: function claim(nodes) {
    			header = claim_element(nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			div0 = claim_element(header_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			a = claim_element(div0_nodes, "A", { href: true, class: true });
    			var a_nodes = children(a);
    			img = claim_element(a_nodes, "IMG", { src: true, alt: true });
    			a_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t0 = claim_space(header_nodes);
    			nav = claim_element(header_nodes, "NAV", { class: true });
    			var nav_nodes = children(nav);
    			div3 = claim_element(nav_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			children(div1).forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t1 = claim_space(div3_nodes);
    			ul = claim_element(div3_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			nav_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = "./logo.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 195, 6, 3240);
    			attr_dev(a, "href", "/");
    			attr_dev(a, "class", "svelte-1jwca59");
    			add_location(a, file$2, 194, 4, 3221);
    			attr_dev(div0, "class", "logo svelte-1jwca59");
    			add_location(div0, file$2, 193, 2, 3198);
    			attr_dev(div1, "class", "middle-line svelte-1jwca59");
    			add_location(div1, file$2, 203, 8, 3447);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty(`mobile-icon${/*showMobileMenu*/ ctx[0] ? " active" : ""}`) + " svelte-1jwca59"));
    			add_location(div2, file$2, 200, 6, 3328);
    			attr_dev(ul, "class", ul_class_value = "" + (null_to_empty(`navbar-list${/*showMobileMenu*/ ctx[0] ? " mobile" : ""}`) + " svelte-1jwca59"));
    			add_location(ul, file$2, 205, 6, 3494);
    			attr_dev(div3, "class", "inner svelte-1jwca59");
    			add_location(div3, file$2, 199, 4, 3302);
    			attr_dev(nav, "class", "svelte-1jwca59");
    			add_location(nav, file$2, 198, 2, 3292);
    			attr_dev(header, "class", "header svelte-1jwca59");
    			add_location(header, file$2, 192, 0, 3172);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(div0, a);
    			append_dev(a, img);
    			append_dev(header, t0);
    			append_dev(header, nav);
    			append_dev(nav, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div3, t1);
    			append_dev(div3, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			dispose = listen_dev(div2, "click", /*handleMobileIconClick*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*showMobileMenu*/ 1 && div2_class_value !== (div2_class_value = "" + (null_to_empty(`mobile-icon${/*showMobileMenu*/ ctx[0] ? " active" : ""}`) + " svelte-1jwca59"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*$url, links, $isActive*/ 14) {
    				each_value = /*links*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*showMobileMenu*/ 1 && ul_class_value !== (ul_class_value = "" + (null_to_empty(`navbar-list${/*showMobileMenu*/ ctx[0] ? " mobile" : ""}`) + " svelte-1jwca59"))) {
    				attr_dev(ul, "class", ul_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $url;
    	let $isActive;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(1, $url = $$value));
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(2, $isActive = $$value));
    	let showMobileMenu = false;

    	const links = [
    		["./index", "Startseite"],
    		["./uberuns", "Über uns"],
    		["./referenzen", "Referenzen"],
    		["./leistungen", "Leistungen"],
    		["./impressum", "Impressum"]
    	];

    	const handleMobileIconClick = () => $$invalidate(0, showMobileMenu = !showMobileMenu);

    	const mediaQueryHandler = e => {
    		if (!e.matches) {
    			$$invalidate(0, showMobileMenu = false);
    		}
    	};

    	onMount(() => {
    		const mediaListener = window.matchMedia("(max-width: 767px)");
    		mediaListener.addListener(mediaQueryHandler);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		isActive,
    		url,
    		showMobileMenu,
    		links,
    		handleMobileIconClick,
    		mediaQueryHandler,
    		$url,
    		$isActive
    	});

    	$$self.$inject_state = $$props => {
    		if ("showMobileMenu" in $$props) $$invalidate(0, showMobileMenu = $$props.showMobileMenu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showMobileMenu, $url, $isActive, links, handleMobileIconClick];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/pages/components/Footer.svelte generated by Svelte v3.19.2 */

    const file$3 = "src/pages/components/Footer.svelte";

    function create_fragment$4(ctx) {
    	let footer;
    	let div;
    	let h5;
    	let t0;
    	let t1;
    	let h2;
    	let t2;
    	let t3;
    	let span0;
    	let t4;
    	let t5;
    	let span1;
    	let t6;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div = element("div");
    			h5 = element("h5");
    			t0 = text("LASS UNS ZUSAMMEN ARBEITEN");
    			t1 = space();
    			h2 = element("h2");
    			t2 = text("+49 30 984 34 329");
    			t3 = space();
    			span0 = element("span");
    			t4 = text("Altonaer Str 59-61, 13581 Berlin");
    			t5 = space();
    			span1 = element("span");
    			t6 = text("email:info@ikph.de");
    			this.h();
    		},
    		l: function claim(nodes) {
    			footer = claim_element(nodes, "FOOTER", { class: true });
    			var footer_nodes = children(footer);
    			div = claim_element(footer_nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			h5 = claim_element(div_nodes, "H5", { class: true });
    			var h5_nodes = children(h5);
    			t0 = claim_text(h5_nodes, "LASS UNS ZUSAMMEN ARBEITEN");
    			h5_nodes.forEach(detach_dev);
    			t1 = claim_space(div_nodes);
    			h2 = claim_element(div_nodes, "H2", { class: true });
    			var h2_nodes = children(h2);
    			t2 = claim_text(h2_nodes, "+49 30 984 34 329");
    			h2_nodes.forEach(detach_dev);
    			t3 = claim_space(div_nodes);
    			span0 = claim_element(div_nodes, "SPAN", { class: true });
    			var span0_nodes = children(span0);
    			t4 = claim_text(span0_nodes, "Altonaer Str 59-61, 13581 Berlin");
    			span0_nodes.forEach(detach_dev);
    			t5 = claim_space(div_nodes);
    			span1 = claim_element(div_nodes, "SPAN", { class: true });
    			var span1_nodes = children(span1);
    			t6 = claim_text(span1_nodes, "email:info@ikph.de");
    			span1_nodes.forEach(detach_dev);
    			div_nodes.forEach(detach_dev);
    			footer_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h5, "class", "svelte-1m6zneg");
    			add_location(h5, file$3, 54, 4, 898);
    			attr_dev(h2, "class", "svelte-1m6zneg");
    			add_location(h2, file$3, 55, 4, 938);
    			attr_dev(span0, "class", "svelte-1m6zneg");
    			add_location(span0, file$3, 56, 4, 969);
    			attr_dev(span1, "class", "svelte-1m6zneg");
    			add_location(span1, file$3, 57, 4, 1019);
    			attr_dev(div, "class", "footer-text");
    			add_location(div, file$3, 53, 2, 868);
    			attr_dev(footer, "class", "svelte-1m6zneg");
    			add_location(footer, file$3, 52, 0, 857);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div);
    			append_dev(div, h5);
    			append_dev(h5, t0);
    			append_dev(div, t1);
    			append_dev(div, h2);
    			append_dev(h2, t2);
    			append_dev(div, t3);
    			append_dev(div, span0);
    			append_dev(span0, t4);
    			append_dev(div, t5);
    			append_dev(div, span1);
    			append_dev(span1, t6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/pages/_layout.svelte generated by Svelte v3.19.2 */
    const file$4 = "src/pages/_layout.svelte";
    const get_default_slot_changes = dirty => ({});
    const get_default_slot_context = ctx => ({ decorator: PageTransitions });

    function create_fragment$5(ctx) {
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let p;
    	let t3;
    	let t4;
    	let t5;
    	let a;
    	let img;
    	let img_src_value;
    	let t6;
    	let a_href_value;
    	let current;
    	const header = new Header({ $$inline: true });
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(header.$$.fragment);
    			t0 = space();
    			if (default_slot) default_slot.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			t2 = space();
    			div1 = element("div");
    			p = element("p");
    			t3 = text("IKPH Inter-Kontakt Projekt und Handel GmbH ©");
    			t4 = text(/*date*/ ctx[1]);
    			t5 = text(" | Crafted in\n    ");
    			a = element("a");
    			img = element("img");
    			t6 = text("\n      - design studio");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div0 = claim_element(nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			claim_component(header.$$.fragment, div0_nodes);
    			t0 = claim_space(div0_nodes);
    			if (default_slot) default_slot.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(nodes);
    			claim_component(footer.$$.fragment, nodes);
    			t2 = claim_space(nodes);
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			p = claim_element(div1_nodes, "P", {});
    			var p_nodes = children(p);
    			t3 = claim_text(p_nodes, "IKPH Inter-Kontakt Projekt und Handel GmbH ©");
    			t4 = claim_text(p_nodes, /*date*/ ctx[1]);
    			t5 = claim_text(p_nodes, " | Crafted in\n    ");
    			a = claim_element(p_nodes, "A", { href: true, class: true });
    			var a_nodes = children(a);
    			img = claim_element(a_nodes, "IMG", { src: true, alt: true, class: true });
    			t6 = claim_text(a_nodes, "\n      - design studio");
    			a_nodes.forEach(detach_dev);
    			p_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "container svelte-1uyme28");
    			add_location(div0, file$4, 35, 0, 627);
    			if (img.src !== (img_src_value = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAmCAYAAACGeMg8AAAACXBIWXMAAAsSAAALEgHS3X78AAAD3klEQVRYw+2ZS2xNURSG79WnRzXEoxKJRA2UqBYlUuo58AwSJGIgYYAYCIIqAwaohI4I8RpIExGlngkmJERJVFXRXm0FA6EafWi1qlr/kv/KcXLP3vuce5t20JV8uX2cs/dZ+6z1r7X39fl6reeaH8SDvgrk/7G8ViwOJID+DsSF+UzxirGFfqFuGgsugNvgJrkBrpNroBAcAylgIDgMOkEAVIIqflaDd+AkGO7RiWhwnmNV28av4t+KQYz1JlnlH3woE96CLHAJdGiuvWh5g25sEfioGfszn/0/RwIuHGkAuWAhf3a6TpwsYPi5sT7gNGhVjP0bHOGb+2cxLh1pZ5hNBSWaa9+DVJeOjAKP+LBO434CGfa37daRTubAepCtmfAXWMNVNrVNoFYz/wOKgS9cR+S1nwWzGauqa4+DJEMnJMyvcAFUi7MZRIVypNilI8J9sJyqprpOFmmmoSPTQZlmPFGu5FAiIp7tBi/BG0PKKdcSzxtAm2JiUcQtdoVxsEOgyUAJY1SDpIF0fupItYRLBnVdNXkhV1Flg8BdTc41g8WhwioSlkS5VD1ADWuDqqasNqgdpWBoV7Y4KzU1RcThAEhUVPJz4KdG9nN1rc8QKlAWE1PHDJIJxpBnmtUsAhMd5h8HHmve6lcwTSXlEm95oAU0cmWD1JM6B2rZl0lxzOGqOT1IE2tKqPjeBr4ZqGSiTru/e5Bfq66fAnNZcVUti+TSCNv80sVe1ixCG2uHUvliKKdeHZEHvAeWgKsGNSDTNv888Fpz3wd26H6dIxVhOCJ8YXis0yRsC2uKtb3INawdA3SKEwlHOjiZCMZTg6Qfz7lTmOSq7UA9BSbKxJHqMB0J7g8Ogr2at1JPuQ4mua5BfGi6QRNP91gmafBAM1sXyZP5lEpVPTgBRoN8gyTfwa22kUl7sJShMccDkrBT+HalptzSrHIZ5bpUc10N2yG/rxtMEnkrE9vpAevYjrRqHBFZHtydpzKzNHnXbpBzzSygsW4nT2OFzmCYTLYxyfIZJN3WMU9g9ZVQPWNwOGGy73B19HIUPOcJSSAEFaTcQnBvIsXsFSnh0dEKEk7HkMdjJ2OLjZD8WsMmn6csRR7HaGTL42av/1dpKiPoSDAsNrKmeAkvOUUZ6TY3IlHZQ+0/5CRymUa9nJrQ7TwW7XZHhDvMkxcu76uhkPi9OBLoAkekuu/kIYWb+6RnG+ZF88WRJ13gSCcPonexJpjes9Z+FOrGktmcFfKALEhBGOSxLsnGaRXYx7Ykm71dju33/WCBSbuu+34kQfN9hFv6WuQzmocGOqJ8vdZrPcf+AKYNgfyeEDunAAAAAElFTkSuQmCC")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Tworzenie i projektowanie stron internetowych");
    			attr_dev(img, "class", "svelte-1uyme28");
    			add_location(img, file$4, 46, 6, 870);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("https://varvanin.eu"));
    			attr_dev(a, "class", "svelte-1uyme28");
    			add_location(a, file$4, 45, 4, 825);
    			add_location(p, file$4, 43, 2, 749);
    			attr_dev(div1, "class", "copyright svelte-1uyme28");
    			add_location(div1, file$4, 42, 0, 723);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(header, div0, null);
    			append_dev(div0, t0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(p, a);
    			append_dev(a, img);
    			append_dev(a, t6);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, get_default_slot_changes));
    			}

    			if (!current || dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("https://varvanin.eu"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(default_slot, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(default_slot, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(header);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	let year = new Date();
    	let date = year.getFullYear();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Layout", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		url,
    		PageTransitions,
    		Header,
    		Footer,
    		year,
    		date,
    		$url
    	});

    	$$self.$inject_state = $$props => {
    		if ("year" in $$props) year = $$props.year;
    		if ("date" in $$props) $$invalidate(1, date = $$props.date);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$url, date, year, $$scope, $$slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/pages/_fallback.svelte generated by Svelte v3.19.2 */
    const file$5 = "src/pages/_fallback.svelte";

    function create_fragment$6(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let a;
    	let t3;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("404");
    			t1 = space();
    			div1 = element("div");
    			t2 = text("Seite nicht gefunden. \n  \n  ");
    			a = element("a");
    			t3 = text("Zurück");
    			this.h();
    		},
    		l: function claim(nodes) {
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			t0 = claim_text(div0_nodes, "404");
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			t2 = claim_text(div1_nodes, "Seite nicht gefunden. \n  \n  ");
    			a = claim_element(div1_nodes, "A", { href: true });
    			var a_nodes = children(a);
    			t3 = claim_text(a_nodes, "Zurück");
    			a_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(div0, "class", "huge svelte-aioo8o");
    			add_location(div0, file$5, 18, 2, 268);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../"));
    			add_location(a, file$5, 21, 2, 397);
    			attr_dev(div1, "class", "big");
    			add_location(div1, file$5, 19, 2, 298);
    			attr_dev(div2, "class", "e404 svelte-aioo8o");
    			add_location(div2, file$5, 17, 0, 247);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(a, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", $$slots, []);
    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Fallback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/pages/components/Hero.svelte generated by Svelte v3.19.2 */

    const file$6 = "src/pages/components/Hero.svelte";

    function create_fragment$7(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t = text(/*intro*/ ctx[0]);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h1 = claim_element(div0_nodes, "H1", { class: true });
    			var h1_nodes = children(h1);
    			t = claim_text(h1_nodes, /*intro*/ ctx[0]);
    			h1_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(h1, "class", "svelte-1a3otox");
    			add_location(h1, file$6, 40, 4, 725);
    			attr_dev(div0, "class", "intro svelte-1a3otox");
    			add_location(div0, file$6, 39, 2, 701);
    			attr_dev(div1, "class", "hero svelte-1a3otox");
    			add_location(div1, file$6, 38, 0, 680);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let intro = "Wir grüßen Sie - und laden Sie herzlich ein, unsere Dienstleistungen in Anspruch zu nehmen!";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hero> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Hero", $$slots, []);
    	$$self.$capture_state = () => ({ intro });

    	$$self.$inject_state = $$props => {
    		if ("intro" in $$props) $$invalidate(0, intro = $$props.intro);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [intro];
    }

    class Hero extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hero",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var siema_min = createCommonjsModule(function (module, exports) {
    !function(e,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,function(){return function(e){function t(r){if(i[r])return i[r].exports;var n=i[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,t),n.l=!0,n.exports}var i={};return t.m=e,t.c=i,t.d=function(e,i,r){t.o(e,i)||Object.defineProperty(e,i,{configurable:!1,enumerable:!0,get:r});},t.n=function(e){var i=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(i,"a",i),i},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,i){function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s=function(){function e(e,t){for(var i=0;i<t.length;i++){var r=t[i];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r);}}return function(t,i,r){return i&&e(t.prototype,i),r&&e(t,r),t}}(),l=function(){function e(t){var i=this;if(r(this,e),this.config=e.mergeSettings(t),this.selector="string"==typeof this.config.selector?document.querySelector(this.config.selector):this.config.selector,null===this.selector)throw new Error("Something wrong with your selector 😭");this.resolveSlidesNumber(),this.selectorWidth=this.selector.offsetWidth,this.innerElements=[].slice.call(this.selector.children),this.currentSlide=this.config.loop?this.config.startIndex%this.innerElements.length:Math.max(0,Math.min(this.config.startIndex,this.innerElements.length-this.perPage)),this.transformProperty=e.webkitOrNot(),["resizeHandler","touchstartHandler","touchendHandler","touchmoveHandler","mousedownHandler","mouseupHandler","mouseleaveHandler","mousemoveHandler","clickHandler"].forEach(function(e){i[e]=i[e].bind(i);}),this.init();}return s(e,[{key:"attachEvents",value:function(){window.addEventListener("resize",this.resizeHandler),this.config.draggable&&(this.pointerDown=!1,this.drag={startX:0,endX:0,startY:0,letItGo:null,preventClick:!1},this.selector.addEventListener("touchstart",this.touchstartHandler),this.selector.addEventListener("touchend",this.touchendHandler),this.selector.addEventListener("touchmove",this.touchmoveHandler),this.selector.addEventListener("mousedown",this.mousedownHandler),this.selector.addEventListener("mouseup",this.mouseupHandler),this.selector.addEventListener("mouseleave",this.mouseleaveHandler),this.selector.addEventListener("mousemove",this.mousemoveHandler),this.selector.addEventListener("click",this.clickHandler));}},{key:"detachEvents",value:function(){window.removeEventListener("resize",this.resizeHandler),this.selector.removeEventListener("touchstart",this.touchstartHandler),this.selector.removeEventListener("touchend",this.touchendHandler),this.selector.removeEventListener("touchmove",this.touchmoveHandler),this.selector.removeEventListener("mousedown",this.mousedownHandler),this.selector.removeEventListener("mouseup",this.mouseupHandler),this.selector.removeEventListener("mouseleave",this.mouseleaveHandler),this.selector.removeEventListener("mousemove",this.mousemoveHandler),this.selector.removeEventListener("click",this.clickHandler);}},{key:"init",value:function(){this.attachEvents(),this.selector.style.overflow="hidden",this.selector.style.direction=this.config.rtl?"rtl":"ltr",this.buildSliderFrame(),this.config.onInit.call(this);}},{key:"buildSliderFrame",value:function(){var e=this.selectorWidth/this.perPage,t=this.config.loop?this.innerElements.length+2*this.perPage:this.innerElements.length;this.sliderFrame=document.createElement("div"),this.sliderFrame.style.width=e*t+"px",this.enableTransition(),this.config.draggable&&(this.selector.style.cursor="-webkit-grab");var i=document.createDocumentFragment();if(this.config.loop)for(var r=this.innerElements.length-this.perPage;r<this.innerElements.length;r++){var n=this.buildSliderFrameItem(this.innerElements[r].cloneNode(!0));i.appendChild(n);}for(var s=0;s<this.innerElements.length;s++){var l=this.buildSliderFrameItem(this.innerElements[s]);i.appendChild(l);}if(this.config.loop)for(var o=0;o<this.perPage;o++){var a=this.buildSliderFrameItem(this.innerElements[o].cloneNode(!0));i.appendChild(a);}this.sliderFrame.appendChild(i),this.selector.innerHTML="",this.selector.appendChild(this.sliderFrame),this.slideToCurrent();}},{key:"buildSliderFrameItem",value:function(e){var t=document.createElement("div");return t.style.cssFloat=this.config.rtl?"right":"left",t.style.float=this.config.rtl?"right":"left",t.style.width=(this.config.loop?100/(this.innerElements.length+2*this.perPage):100/this.innerElements.length)+"%",t.appendChild(e),t}},{key:"resolveSlidesNumber",value:function(){if("number"==typeof this.config.perPage)this.perPage=this.config.perPage;else if("object"===n(this.config.perPage)){this.perPage=1;for(var e in this.config.perPage)window.innerWidth>=e&&(this.perPage=this.config.perPage[e]);}}},{key:"prev",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments[1];if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;if(this.config.loop){if(this.currentSlide-e<0){this.disableTransition();var r=this.currentSlide+this.innerElements.length,n=this.perPage,s=r+n,l=(this.config.rtl?1:-1)*s*(this.selectorWidth/this.perPage),o=this.config.draggable?this.drag.endX-this.drag.startX:0;this.sliderFrame.style[this.transformProperty]="translate3d("+(l+o)+"px, 0, 0)",this.currentSlide=r-e;}else this.currentSlide=this.currentSlide-e;}else this.currentSlide=Math.max(this.currentSlide-e,0);i!==this.currentSlide&&(this.slideToCurrent(this.config.loop),this.config.onChange.call(this),t&&t.call(this));}}},{key:"next",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments[1];if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;if(this.config.loop){if(this.currentSlide+e>this.innerElements.length-this.perPage){this.disableTransition();var r=this.currentSlide-this.innerElements.length,n=this.perPage,s=r+n,l=(this.config.rtl?1:-1)*s*(this.selectorWidth/this.perPage),o=this.config.draggable?this.drag.endX-this.drag.startX:0;this.sliderFrame.style[this.transformProperty]="translate3d("+(l+o)+"px, 0, 0)",this.currentSlide=r+e;}else this.currentSlide=this.currentSlide+e;}else this.currentSlide=Math.min(this.currentSlide+e,this.innerElements.length-this.perPage);i!==this.currentSlide&&(this.slideToCurrent(this.config.loop),this.config.onChange.call(this),t&&t.call(this));}}},{key:"disableTransition",value:function(){this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;}},{key:"enableTransition",value:function(){this.sliderFrame.style.webkitTransition="all "+this.config.duration+"ms "+this.config.easing,this.sliderFrame.style.transition="all "+this.config.duration+"ms "+this.config.easing;}},{key:"goTo",value:function(e,t){if(!(this.innerElements.length<=this.perPage)){var i=this.currentSlide;this.currentSlide=this.config.loop?e%this.innerElements.length:Math.min(Math.max(e,0),this.innerElements.length-this.perPage),i!==this.currentSlide&&(this.slideToCurrent(),this.config.onChange.call(this),t&&t.call(this));}}},{key:"slideToCurrent",value:function(e){var t=this,i=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,r=(this.config.rtl?1:-1)*i*(this.selectorWidth/this.perPage);e?requestAnimationFrame(function(){requestAnimationFrame(function(){t.enableTransition(),t.sliderFrame.style[t.transformProperty]="translate3d("+r+"px, 0, 0)";});}):this.sliderFrame.style[this.transformProperty]="translate3d("+r+"px, 0, 0)";}},{key:"updateAfterDrag",value:function(){var e=(this.config.rtl?-1:1)*(this.drag.endX-this.drag.startX),t=Math.abs(e),i=this.config.multipleDrag?Math.ceil(t/(this.selectorWidth/this.perPage)):1,r=e>0&&this.currentSlide-i<0,n=e<0&&this.currentSlide+i>this.innerElements.length-this.perPage;e>0&&t>this.config.threshold&&this.innerElements.length>this.perPage?this.prev(i):e<0&&t>this.config.threshold&&this.innerElements.length>this.perPage&&this.next(i),this.slideToCurrent(r||n);}},{key:"resizeHandler",value:function(){this.resolveSlidesNumber(),this.currentSlide+this.perPage>this.innerElements.length&&(this.currentSlide=this.innerElements.length<=this.perPage?0:this.innerElements.length-this.perPage),this.selectorWidth=this.selector.offsetWidth,this.buildSliderFrame();}},{key:"clearDrag",value:function(){this.drag={startX:0,endX:0,startY:0,letItGo:null,preventClick:this.drag.preventClick};}},{key:"touchstartHandler",value:function(e){-1!==["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)||(e.stopPropagation(),this.pointerDown=!0,this.drag.startX=e.touches[0].pageX,this.drag.startY=e.touches[0].pageY);}},{key:"touchendHandler",value:function(e){e.stopPropagation(),this.pointerDown=!1,this.enableTransition(),this.drag.endX&&this.updateAfterDrag(),this.clearDrag();}},{key:"touchmoveHandler",value:function(e){if(e.stopPropagation(),null===this.drag.letItGo&&(this.drag.letItGo=Math.abs(this.drag.startY-e.touches[0].pageY)<Math.abs(this.drag.startX-e.touches[0].pageX)),this.pointerDown&&this.drag.letItGo){e.preventDefault(),this.drag.endX=e.touches[0].pageX,this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;var t=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,i=t*(this.selectorWidth/this.perPage),r=this.drag.endX-this.drag.startX,n=this.config.rtl?i+r:i-r;this.sliderFrame.style[this.transformProperty]="translate3d("+(this.config.rtl?1:-1)*n+"px, 0, 0)";}}},{key:"mousedownHandler",value:function(e){-1!==["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)||(e.preventDefault(),e.stopPropagation(),this.pointerDown=!0,this.drag.startX=e.pageX);}},{key:"mouseupHandler",value:function(e){e.stopPropagation(),this.pointerDown=!1,this.selector.style.cursor="-webkit-grab",this.enableTransition(),this.drag.endX&&this.updateAfterDrag(),this.clearDrag();}},{key:"mousemoveHandler",value:function(e){if(e.preventDefault(),this.pointerDown){"A"===e.target.nodeName&&(this.drag.preventClick=!0),this.drag.endX=e.pageX,this.selector.style.cursor="-webkit-grabbing",this.sliderFrame.style.webkitTransition="all 0ms "+this.config.easing,this.sliderFrame.style.transition="all 0ms "+this.config.easing;var t=this.config.loop?this.currentSlide+this.perPage:this.currentSlide,i=t*(this.selectorWidth/this.perPage),r=this.drag.endX-this.drag.startX,n=this.config.rtl?i+r:i-r;this.sliderFrame.style[this.transformProperty]="translate3d("+(this.config.rtl?1:-1)*n+"px, 0, 0)";}}},{key:"mouseleaveHandler",value:function(e){this.pointerDown&&(this.pointerDown=!1,this.selector.style.cursor="-webkit-grab",this.drag.endX=e.pageX,this.drag.preventClick=!1,this.enableTransition(),this.updateAfterDrag(),this.clearDrag());}},{key:"clickHandler",value:function(e){this.drag.preventClick&&e.preventDefault(),this.drag.preventClick=!1;}},{key:"remove",value:function(e,t){if(e<0||e>=this.innerElements.length)throw new Error("Item to remove doesn't exist 😭");var i=e<this.currentSlide,r=this.currentSlide+this.perPage-1===e;(i||r)&&this.currentSlide--,this.innerElements.splice(e,1),this.buildSliderFrame(),t&&t.call(this);}},{key:"insert",value:function(e,t,i){if(t<0||t>this.innerElements.length+1)throw new Error("Unable to inset it at this index 😭");if(-1!==this.innerElements.indexOf(e))throw new Error("The same item in a carousel? Really? Nope 😭");var r=t<=this.currentSlide>0&&this.innerElements.length;this.currentSlide=r?this.currentSlide+1:this.currentSlide,this.innerElements.splice(t,0,e),this.buildSliderFrame(),i&&i.call(this);}},{key:"prepend",value:function(e,t){this.insert(e,0),t&&t.call(this);}},{key:"append",value:function(e,t){this.insert(e,this.innerElements.length+1),t&&t.call(this);}},{key:"destroy",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],t=arguments[1];if(this.detachEvents(),this.selector.style.cursor="auto",e){for(var i=document.createDocumentFragment(),r=0;r<this.innerElements.length;r++)i.appendChild(this.innerElements[r]);this.selector.innerHTML="",this.selector.appendChild(i),this.selector.removeAttribute("style");}t&&t.call(this);}}],[{key:"mergeSettings",value:function(e){var t={selector:".siema",duration:200,easing:"ease-out",perPage:1,startIndex:0,draggable:!0,multipleDrag:!0,threshold:20,loop:!1,rtl:!1,onInit:function(){},onChange:function(){}},i=e;for(var r in i)t[r]=i[r];return t}},{key:"webkitOrNot",value:function(){return "string"==typeof document.documentElement.style.transform?"transform":"WebkitTransform"}}]),e}();t.default=l,e.exports=t.default;}])});
    });

    var Siema = unwrapExports(siema_min);
    var siema_min_1 = siema_min.Siema;

    function add(node, event, handler) {
    	node.addEventListener(event, handler);
    	return () => node.removeEventListener(event, handler);
    }

    function dispatch_tap(node, x, y) {
    	node.dispatchEvent(new CustomEvent('tap', {
    		detail: { x, y }
    	}));
    }

    function handle_focus(event) {
    	const remove_keydown_handler = add(event.currentTarget, 'keydown', (event) => {
    		if (event.which === 32) dispatch_tap(event.currentTarget, null, null);
    	});

    	const remove_blur_handler = add(event.currentTarget, 'blur', (event) => {
    		remove_keydown_handler();
    		remove_blur_handler();
    	});
    }

    function is_button(node) {
    	return node.tagName === 'BUTTON' || node.type === 'button';
    }

    function tap_pointer(node) {
    	function handle_pointerdown(event) {
    		if ((node ).disabled) return;
    		const { clientX, clientY } = event;

    		const remove_pointerup_handler = add(node, 'pointerup', (event) => {
    			if (Math.abs(event.clientX - clientX) > 5) return;
    			if (Math.abs(event.clientY - clientY) > 5) return;

    			dispatch_tap(node, event.clientX, event.clientY);
    			remove_pointerup_handler();
    		});

    		setTimeout(remove_pointerup_handler, 300);
    	}

    	const remove_pointerdown_handler = add(node, 'pointerdown', handle_pointerdown);
    	const remove_focus_handler = is_button(node ) && add(node, 'focus', handle_focus);

    	return {
    		destroy() {
    			remove_pointerdown_handler();
    			remove_focus_handler && remove_focus_handler();
    		}
    	};
    }

    function tap_legacy(node) {
    	let mouse_enabled = true;
    	let mouse_timeout;

    	function handle_mousedown(event) {
    		const { clientX, clientY } = event;

    		const remove_mouseup_handler = add(node, 'mouseup', (event) => {
    			if (!mouse_enabled) return;
    			if (Math.abs(event.clientX - clientX) > 5) return;
    			if (Math.abs(event.clientY - clientY) > 5) return;

    			dispatch_tap(node, event.clientX, event.clientY);
    			remove_mouseup_handler();
    		});

    		clearTimeout(mouse_timeout);
    		setTimeout(remove_mouseup_handler, 300);
    	}

    	function handle_touchstart(event) {
    		if (event.changedTouches.length !== 1) return;
    		if ((node ).disabled) return;

    		const touch = event.changedTouches[0];
    		const { identifier, clientX, clientY } = touch;

    		const remove_touchend_handler = add(node, 'touchend', (event) => {
    			const touch = Array.from(event.changedTouches).find(t => t.identifier === identifier);
    			if (!touch) return;

    			if (Math.abs(touch.clientX - clientX) > 5) return;
    			if (Math.abs(touch.clientY - clientY) > 5) return;

    			dispatch_tap(node, touch.clientX, touch.clientY);

    			mouse_enabled = false;
    			mouse_timeout = setTimeout(() => {
    				mouse_enabled = true;
    			}, 350);
    		});

    		setTimeout(remove_touchend_handler, 300);
    	}

    	const remove_mousedown_handler = add(node, 'mousedown', handle_mousedown);
    	const remove_touchstart_handler = add(node, 'touchstart', handle_touchstart);
    	const remove_focus_handler = is_button(node ) && add(node, 'focus', handle_focus);

    	return {
    		destroy() {
    			remove_mousedown_handler();
    			remove_touchstart_handler();
    			remove_focus_handler && remove_focus_handler();
    		}
    	};
    }

    const tap = typeof PointerEvent === 'function'
    	? tap_pointer
    	: tap_legacy;

    /* node_modules/@centroculturadigital-mx/svelte-carousel/src/Carousel.svelte generated by Svelte v3.19.2 */
    const file$7 = "node_modules/@centroculturadigital-mx/svelte-carousel/src/Carousel.svelte";
    const get_right_control_slot_changes = dirty => ({});
    const get_right_control_slot_context = ctx => ({});

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[20] = i;
    	return child_ctx;
    }

    const get_left_control_slot_changes = dirty => ({});
    const get_left_control_slot_context = ctx => ({});

    // (156:4) {#each pips as pip, i ('pip_' + id + '_' + i)}
    function create_each_block$2(key_1, ctx) {
    	let li;
    	let li_class_value;
    	let tap_action;
    	let dispose;

    	function tap_handler(...args) {
    		return /*tap_handler*/ ctx[17](/*i*/ ctx[20], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			this.h();
    		},
    		l: function claim(nodes) {
    			li = claim_element(nodes, "LI", { class: true });
    			children(li).forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(li, "class", li_class_value = "" + (null_to_empty(/*current*/ ctx[0] == /*i*/ ctx[20] ? "active" : "") + " svelte-jrqjob"));
    			add_location(li, file$7, 156, 6, 2731);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);

    			dispose = [
    				action_destroyer(tap_action = tap.call(null, li)),
    				listen_dev(li, "tap", tap_handler, false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*current, pips*/ 9 && li_class_value !== (li_class_value = "" + (null_to_empty(/*current*/ ctx[0] == /*i*/ ctx[20] ? "active" : "") + " svelte-jrqjob"))) {
    				attr_dev(li, "class", li_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(156:4) {#each pips as pip, i ('pip_' + id + '_' + i)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div1;
    	let button0;
    	let tap_action;
    	let t0;
    	let div0;
    	let t1;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let button1;
    	let tap_action_1;
    	let current;
    	let dispose;
    	const left_control_slot_template = /*$$slots*/ ctx[15]["left-control"];
    	const left_control_slot = create_slot(left_control_slot_template, ctx, /*$$scope*/ ctx[14], get_left_control_slot_context);
    	const default_slot_template = /*$$slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);
    	let each_value = /*pips*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => "pip_" + /*id*/ ctx[1] + "_" + /*i*/ ctx[20];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const right_control_slot_template = /*$$slots*/ ctx[15]["right-control"];
    	const right_control_slot = create_slot(right_control_slot_template, ctx, /*$$scope*/ ctx[14], get_right_control_slot_context);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			button0 = element("button");
    			if (left_control_slot) left_control_slot.c();
    			t0 = space();
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			button1 = element("button");
    			if (right_control_slot) right_control_slot.c();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			button0 = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button0_nodes = children(button0);
    			if (left_control_slot) left_control_slot.l(button0_nodes);
    			button0_nodes.forEach(detach_dev);
    			t0 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			if (default_slot) default_slot.l(div0_nodes);
    			div0_nodes.forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			ul = claim_element(div1_nodes, "UL", { class: true });
    			var ul_nodes = children(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(ul_nodes);
    			}

    			ul_nodes.forEach(detach_dev);
    			t2 = claim_space(div1_nodes);
    			button1 = claim_element(div1_nodes, "BUTTON", { class: true });
    			var button1_nodes = children(button1);
    			if (right_control_slot) right_control_slot.l(button1_nodes);
    			button1_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			attr_dev(button0, "class", "left svelte-jrqjob");
    			add_location(button0, file$7, 148, 2, 2515);
    			attr_dev(div0, "class", "slides");
    			add_location(div0, file$7, 151, 2, 2606);
    			attr_dev(ul, "class", "svelte-jrqjob");
    			add_location(ul, file$7, 154, 2, 2669);
    			attr_dev(button1, "class", "right svelte-jrqjob");
    			add_location(button1, file$7, 159, 2, 2828);
    			attr_dev(div1, "class", "carousel svelte-jrqjob");
    			add_location(div1, file$7, 147, 0, 2490);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, button0);

    			if (left_control_slot) {
    				left_control_slot.m(button0, null);
    			}

    			append_dev(div1, t0);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[16](div0);
    			append_dev(div1, t1);
    			append_dev(div1, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			append_dev(div1, t2);
    			append_dev(div1, button1);

    			if (right_control_slot) {
    				right_control_slot.m(button1, null);
    			}

    			current = true;

    			dispose = [
    				action_destroyer(tap_action = tap.call(null, button0)),
    				listen_dev(button0, "tap", /*left*/ ctx[4], false, false, false),
    				action_destroyer(tap_action_1 = tap.call(null, button1)),
    				listen_dev(button1, "tap", /*right*/ ctx[5], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (left_control_slot && left_control_slot.p && dirty & /*$$scope*/ 16384) {
    				left_control_slot.p(get_slot_context(left_control_slot_template, ctx, /*$$scope*/ ctx[14], get_left_control_slot_context), get_slot_changes(left_control_slot_template, /*$$scope*/ ctx[14], dirty, get_left_control_slot_changes));
    			}

    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16384) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[14], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null));
    			}

    			if (dirty & /*current, pips, goTo*/ 73) {
    				const each_value = /*pips*/ ctx[3];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, destroy_block, create_each_block$2, null, get_each_context$2);
    			}

    			if (right_control_slot && right_control_slot.p && dirty & /*$$scope*/ 16384) {
    				right_control_slot.p(get_slot_context(right_control_slot_template, ctx, /*$$scope*/ ctx[14], get_right_control_slot_context), get_slot_changes(right_control_slot_template, /*$$scope*/ ctx[14], dirty, get_right_control_slot_changes));
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(left_control_slot, local);
    			transition_in(default_slot, local);
    			transition_in(right_control_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(left_control_slot, local);
    			transition_out(default_slot, local);
    			transition_out(right_control_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (left_control_slot) left_control_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[16](null);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (right_control_slot) right_control_slot.d(detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { perPage = 3 } = $$props;
    	let { loop = true } = $$props;
    	let { autoplay = 0 } = $$props;
    	let { go = 0 } = $$props;
    	let { current = 0 } = $$props;
    	let { useKeys = false } = $$props;
    	let id;
    	let siema;
    	let controller;
    	let timer;

    	onMount(() => {
    		$$invalidate(1, id = Math.ceil(Math.random() * 300000));

    		const onChange = () => {
    			//   console.log("onChange", controller.currentSlide);
    			$$invalidate(0, current = controller.currentSlide);
    		};

    		$$invalidate(12, controller = new Siema({ selector: siema, perPage, loop, onChange }));

    		document.addEventListener("keydown", event => {
    			if (useKeys) {
    				switch (event.keyCode) {
    					case 32:
    						right();
    						break;
    					case 37:
    					case 38:
    						left();
    						break;
    					case 39:
    					case 40:
    						right();
    						break;
    				}
    			}
    		});

    		autoplay && setInterval(right, autoplay);

    		return () => {
    			autoplay && clearTimeout(timer);
    			controller.destroy();
    		};
    	});

    	function left() {
    		$$invalidate(0, current--, current);
    		$$invalidate(0, current %= pips.length);
    		controller.prev(1, goTo(current + 1));
    	}

    	function right() {
    		$$invalidate(0, current++, current);
    		$$invalidate(0, current %= pips.length);
    		controller.next(1, goTo(current - 1));
    	}

    	function goTo(index) {
    		// console.log("go to", index);
    		if (!!controller && (index === 0 || index > 0)) {
    			controller.goTo(index, () => {
    				//   console.log("went to", index);
    				$$invalidate(0, current = index);
    			});
    		}
    	}

    	const writable_props = ["perPage", "loop", "autoplay", "go", "current", "useKeys"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", $$slots, ['left-control','default','right-control']);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, siema = $$value);
    		});
    	}

    	const tap_handler = i => goTo(i);

    	$$self.$set = $$props => {
    		if ("perPage" in $$props) $$invalidate(7, perPage = $$props.perPage);
    		if ("loop" in $$props) $$invalidate(8, loop = $$props.loop);
    		if ("autoplay" in $$props) $$invalidate(9, autoplay = $$props.autoplay);
    		if ("go" in $$props) $$invalidate(10, go = $$props.go);
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("useKeys" in $$props) $$invalidate(11, useKeys = $$props.useKeys);
    		if ("$$scope" in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Siema,
    		tap,
    		onMount,
    		perPage,
    		loop,
    		autoplay,
    		go,
    		current,
    		useKeys,
    		id,
    		siema,
    		controller,
    		timer,
    		left,
    		right,
    		goTo,
    		pips
    	});

    	$$self.$inject_state = $$props => {
    		if ("perPage" in $$props) $$invalidate(7, perPage = $$props.perPage);
    		if ("loop" in $$props) $$invalidate(8, loop = $$props.loop);
    		if ("autoplay" in $$props) $$invalidate(9, autoplay = $$props.autoplay);
    		if ("go" in $$props) $$invalidate(10, go = $$props.go);
    		if ("current" in $$props) $$invalidate(0, current = $$props.current);
    		if ("useKeys" in $$props) $$invalidate(11, useKeys = $$props.useKeys);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("siema" in $$props) $$invalidate(2, siema = $$props.siema);
    		if ("controller" in $$props) $$invalidate(12, controller = $$props.controller);
    		if ("timer" in $$props) timer = $$props.timer;
    		if ("pips" in $$props) $$invalidate(3, pips = $$props.pips);
    	};

    	let pips;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*go*/ 1024) {
    			 goTo(go);
    		}

    		if ($$self.$$.dirty & /*controller*/ 4096) {
    			 $$invalidate(3, pips = controller ? controller.innerElements : []);
    		}
    	};

    	return [
    		current,
    		id,
    		siema,
    		pips,
    		left,
    		right,
    		goTo,
    		perPage,
    		loop,
    		autoplay,
    		go,
    		useKeys,
    		controller,
    		timer,
    		$$scope,
    		$$slots,
    		div0_binding,
    		tap_handler
    	];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			perPage: 7,
    			loop: 8,
    			autoplay: 9,
    			go: 10,
    			current: 0,
    			useKeys: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get perPage() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set perPage(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loop() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loop(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplay() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplay(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get go() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set go(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get current() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set current(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get useKeys() {
    		throw new Error("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set useKeys(value) {
    		throw new Error("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/components/LightBox.svelte generated by Svelte v3.19.2 */
    const file$8 = "src/pages/components/LightBox.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (116:12) {#if content.type=="image"|| !content.type }
    function create_if_block$2(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			img = claim_element(nodes, "IMG", { src: true, alt: true });
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = /*content*/ ctx[1].full)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*content*/ ctx[1].title);
    			add_location(img, file$8, 116, 16, 3078);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*contents*/ 8 && img.src !== (img_src_value = /*content*/ ctx[1].full)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*contents*/ 8 && img_alt_value !== (img_alt_value = /*content*/ ctx[1].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(116:12) {#if content.type==\\\"image\\\"|| !content.type }",
    		ctx
    	});

    	return block;
    }

    // (115:8) {#each contents as content,i ("content_"+i)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let if_block_anchor;
    	let if_block = (/*content*/ ctx[1].type == "image" || !/*content*/ ctx[1].type) && create_if_block$2(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			this.h();
    		},
    		l: function claim(nodes) {
    			first = empty();
    			if (if_block) if_block.l(nodes);
    			if_block_anchor = empty();
    			this.h();
    		},
    		h: function hydrate() {
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*content*/ ctx[1].type == "image" || !/*content*/ ctx[1].type) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(115:8) {#each contents as content,i (\\\"content_\\\"+i)}",
    		ctx
    	});

    	return block;
    }

    // (113:4) <Carousel perPage={({perParge:1})} go={go}>
    function create_default_slot$1(ctx) {
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*contents*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => "content_" + /*i*/ ctx[9];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(nodes);
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*contents*/ 8) {
    				const each_value = /*contents*/ ctx[3];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(113:4) <Carousel perPage={({perParge:1})} go={go}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div1;
    	let header;
    	let button;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div1_class_value;
    	let current;
    	let dispose;

    	const carousel = new Carousel({
    			props: {
    				perPage: { perParge: 1 },
    				go: /*go*/ ctx[0],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			header = element("header");
    			button = element("button");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			create_component(carousel.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			div1 = claim_element(nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			header = claim_element(div1_nodes, "HEADER", { class: true });
    			var header_nodes = children(header);
    			button = claim_element(header_nodes, "BUTTON", {});
    			var button_nodes = children(button);
    			img = claim_element(button_nodes, "IMG", { src: true, alt: true });
    			button_nodes.forEach(detach_dev);
    			header_nodes.forEach(detach_dev);
    			t0 = claim_space(div1_nodes);
    			div0 = claim_element(div1_nodes, "DIV", { class: true });
    			children(div0).forEach(detach_dev);
    			t1 = claim_space(div1_nodes);
    			claim_component(carousel.$$.fragment, div1_nodes);
    			div1_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsSAAALEgHS3X78AAABB0lEQVRIx+1V2wqCQBA1fRXxlpdvSeibE+oLgjLzQj9kszALh8VkdzN6qIEDus6eMzO7MzrO3yxtA1jTd9Zcy28voxG2IxwIBb97M75yLSPUhErhWBQQ5BPhRkhmRORzSLiy78lEoGBysfFOiIEYyRv26QiljgDWNWFyVUQlHwip6ZnIKGMQ6QkBwSe0vDYCuWd64CjSM+GFcObnB2FrS66KBEw+MUQG0bvkuNmHyGUmwVrRh1DzFjLpldtlTd5AzSOOvIPbZVwqd4Z8hANVb1cLmbi6oyKDDh2UqygjjaB0oilzk06uoUPThVERQ8cfTQQqni2lxrDLmXyvOyo+Oq6/8sP5cXsCaq5BhBP4KlEAAAAASUVORK5CYII=")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$8, 107, 12, 2297);
    			add_location(button, file$8, 106, 8, 2259);
    			attr_dev(header, "class", "svelte-70dez0");
    			add_location(header, file$8, 105, 4, 2242);
    			attr_dev(div0, "class", "Lightbox__Overlay svelte-70dez0");
    			add_location(div0, file$8, 111, 4, 2836);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*classList*/ ctx[2]) + " svelte-70dez0"));
    			add_location(div1, file$8, 104, 0, 2214);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, header);
    			append_dev(header, button);
    			append_dev(button, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div1, t1);
    			mount_component(carousel, div1, null);
    			current = true;

    			dispose = [
    				listen_dev(button, "click", /*close*/ ctx[4], false, false, false),
    				listen_dev(div0, "click", /*close*/ ctx[4], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const carousel_changes = {};
    			if (dirty & /*go*/ 1) carousel_changes.go = /*go*/ ctx[0];

    			if (dirty & /*$$scope, contents*/ 1032) {
    				carousel_changes.$$scope = { dirty, ctx };
    			}

    			carousel.$set(carousel_changes);

    			if (!current || dirty & /*classList*/ 4 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*classList*/ ctx[2]) + " svelte-70dez0"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(carousel);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { content } = $$props;
    	let { go } = $$props;
    	let classBase = "LightBox";
    	let classList = `${classBase} ${classBase}--hidden`;
    	let shouldOpen = false;

    	onMount(() => {
    		shouldOpen = true;

    		document.addEventListener("keydown", event => {
    			switch (event.keyCode) {
    				case 27:
    					close();
    					break;
    			}
    		});
    	});

    	const open = goIndex => {
    		if ((goIndex === 0 || goIndex > 0) && shouldOpen) {
    			$$invalidate(2, classList = classBase);
    		}
    	};

    	const close = () => {
    		$$invalidate(0, go = null);
    		$$invalidate(2, classList = `${classBase} ${classBase}--hidden`);
    	};

    	const writable_props = ["content", "go"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LightBox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LightBox", $$slots, []);

    	$$self.$set = $$props => {
    		if ("content" in $$props) $$invalidate(1, content = $$props.content);
    		if ("go" in $$props) $$invalidate(0, go = $$props.go);
    	};

    	$$self.$capture_state = () => ({
    		Carousel,
    		onMount,
    		content,
    		go,
    		classBase,
    		classList,
    		shouldOpen,
    		open,
    		close,
    		contents
    	});

    	$$self.$inject_state = $$props => {
    		if ("content" in $$props) $$invalidate(1, content = $$props.content);
    		if ("go" in $$props) $$invalidate(0, go = $$props.go);
    		if ("classBase" in $$props) classBase = $$props.classBase;
    		if ("classList" in $$props) $$invalidate(2, classList = $$props.classList);
    		if ("shouldOpen" in $$props) shouldOpen = $$props.shouldOpen;
    		if ("contents" in $$props) $$invalidate(3, contents = $$props.contents);
    	};

    	let contents;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*content*/ 2) {
    			 $$invalidate(3, contents = Array.isArray(content) ? content : [content]);
    		}

    		if ($$self.$$.dirty & /*go*/ 1) {
    			 open(go);
    		}
    	};

    	return [go, content, classList, contents, close];
    }

    class LightBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { content: 1, go: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LightBox",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[1] === undefined && !("content" in props)) {
    			console.warn("<LightBox> was created without expected prop 'content'");
    		}

    		if (/*go*/ ctx[0] === undefined && !("go" in props)) {
    			console.warn("<LightBox> was created without expected prop 'go'");
    		}
    	}

    	get content() {
    		throw new Error("<LightBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<LightBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get go() {
    		throw new Error("<LightBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set go(value) {
    		throw new Error("<LightBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/datenschutz.svelte generated by Svelte v3.19.2 */

    const file$9 = "src/pages/datenschutz.svelte";

    function create_fragment$a(ctx) {
    	let meta0;
    	let meta1;
    	let t0;
    	let div0;
    	let h3;
    	let t1;
    	let t2;
    	let div2;
    	let div1;
    	let h40;
    	let t3;
    	let t4;
    	let p0;
    	let t5;
    	let t6;
    	let p1;
    	let t7;
    	let t8;
    	let h41;
    	let t9;
    	let t10;
    	let p2;
    	let t11;
    	let t12;
    	let ul0;
    	let li0;
    	let t13;
    	let t14;
    	let li1;
    	let t15;
    	let t16;
    	let li2;
    	let t17;
    	let t18;
    	let li3;
    	let t19;
    	let t20;
    	let h42;
    	let t21;
    	let t22;
    	let p3;
    	let t23;
    	let t24;
    	let p4;
    	let t25;
    	let t26;
    	let h43;
    	let t27;
    	let t28;
    	let p5;
    	let t29;
    	let t30;
    	let ul1;
    	let li4;
    	let t31;
    	let t32;
    	let li5;
    	let t33;
    	let t34;
    	let li6;
    	let t35;
    	let t36;
    	let li7;
    	let t37;
    	let t38;
    	let p6;
    	let t39;
    	let t40;
    	let h44;
    	let t41;
    	let t42;
    	let p7;
    	let t43;
    	let t44;
    	let ul2;
    	let li8;
    	let t45;
    	let t46;
    	let li9;
    	let t47;
    	let t48;
    	let li10;
    	let t49;
    	let t50;
    	let li11;
    	let t51;
    	let t52;
    	let li12;
    	let t53;
    	let t54;
    	let li13;
    	let t55;
    	let t56;
    	let p8;
    	let t57;
    	let t58;
    	let h45;
    	let t59;
    	let t60;
    	let p9;
    	let t61;
    	let t62;
    	let h46;
    	let t63;
    	let t64;
    	let p10;
    	let t65;
    	let t66;
    	let h47;
    	let t67;
    	let t68;
    	let p11;
    	let t69;
    	let t70;
    	let h48;
    	let t71;
    	let t72;
    	let p12;
    	let t73;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text("Datenschutz");
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h40 = element("h4");
    			t3 = text("Verantwortliche Stelle im Sinne der Datenschutzgesetze, insbesondere der\n      EU-Datenschutzgrundverordnung (DSGVO), ist:");
    			t4 = space();
    			p0 = element("p");
    			t5 = text("Damit Sie unsere angebotene Leistung zur Beratung und Vertretung in\n      Rechtsangelegenheiten in Anspruch nehmen können, erheben, verarbeiten und\n      nutzen wir personenbezogene Daten. Mit der Zustimmung zu dieser\n      Datenschutzerklärung willigen Sie in die Erhebung, Verarbeitung und\n      Nutzung Ihrer personenbezogenen Daten gemäß den nachfolgenden Bestimmungen\n      unter Beachtung des gelten der Datenschutzgrundverordnung ein. Sie können\n      Ihr einmal gegebenes Einverständnis jederzeit mit Wirkung für die Zukunft\n      widerrufen und/ oder künftigen Verwendungen Ihrer Daten widersprechen,\n      sofern die Verarbeitung und Nutzung der Daten nicht zu Zwecken der\n      Vertragsabwicklung benötigt werden. Wir löschen im Übrigen die Daten, wenn\n      etwaige gesetzliche Aufbewahrungspflichten abgelaufen sind, Sie einen\n      Löschungsanspruch geltend gemacht haben oder eine weitere Speicherung\n      nicht mehr erforderlich ist, um den ursprünglich angestrebten\n      (Vertrags-)Zweck zu erfüllen.");
    			t6 = space();
    			p1 = element("p");
    			t7 = text("Wir erheben und verarbeiten personenbezogene Daten als Bestandsdaten nur,\n      wenn dies für die Begründung und inhaltliche Ausgestaltung oder Änderung\n      der vertraglichen Rechtsverhältnisse notwendig sind (Datenerhebungs- und\n      Verarbeitungszweck). Personenbezogene Daten als Nutzungsdaten über die\n      Inanspruchnahme unserer Homepage erheben wir nicht. Bei Eingehung eines\n      Mandatsverhältnisses oder einer Beratung werden folgende Daten erhoben,\n      verarbeitet und gespeichert: Name, Anschrift, Telefonnummer, Emailadresse,\n      gegebenenfalls bei familien- und erbrechtlichen Angelegenheiten das\n      Geburtsdatum und der Geburtsort, sowie die Staatsangehörigkeit.");
    			t8 = space();
    			h41 = element("h4");
    			t9 = text("Zwecke der Datenverarbeitung durch die verantwortliche Stelle und Dritte");
    			t10 = space();
    			p2 = element("p");
    			t11 = text("Wir verarbeiten Ihre personenbezogenen Daten nur zu den in dieser\n      Datenschutzerklärung genannten Zwecken. Eine Übermittlung Ihrer\n      persönlichen Daten an Dritte zu anderen als den genannten Zwecken findet\n      nicht statt. Wir geben Ihre persönlichen Daten nur an Dritte weiter, wenn:");
    			t12 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			t13 = text("Sie Ihre ausdrückliche Einwilligung dazu erteilt haben,");
    			t14 = space();
    			li1 = element("li");
    			t15 = text("die Verarbeitung zur Abwicklung eines Vertrags mit Ihnen erforderlich\n        ist,");
    			t16 = space();
    			li2 = element("li");
    			t17 = text("die Verarbeitung zur Erfüllung einer rechtlichen Verpflichtung\n        erforderlich ist,");
    			t18 = space();
    			li3 = element("li");
    			t19 = text("die Verarbeitung zur Wahrung berechtigter Interessen erforderlich ist\n        und kein Grund zur Annahme besteht, dass Sie ein überwiegendes\n        schutzwürdiges Interesse an der Nichtweitergabe Ihrer Daten haben.");
    			t20 = space();
    			h42 = element("h4");
    			t21 = text("Löschung bzw. Sperrung der Daten");
    			t22 = space();
    			p3 = element("p");
    			t23 = text("Wir halten uns an die Grundsätze der Datenvermeidung und Datensparsamkeit.\n      Wir speichern Ihre personenbezogenen Daten daher nur so lange, wie dies\n      zur Erreichung der hier genannten Zwecke erforderlich ist oder wie es die\n      vom Gesetzgeber vorgesehenen vielfältigen Speicherfristen vorsehen. Nach\n      Fortfall des jeweiligen Zweckes bzw. Ablauf dieser Fristen werden die\n      entsprechenden Daten routinemäßig und entsprechend den gesetzlichen\n      Vorschriften gesperrt oder gelöscht.");
    			t24 = space();
    			p4 = element("p");
    			t25 = text("Natürlich lassen wir Ihre individuellen Wünsche in die Planungen\n      einfließen und können auch einzelne Leistungen anbieten.");
    			t26 = space();
    			h43 = element("h4");
    			t27 = text("Recht auf Auskunft, Löschung und Sperrung");
    			t28 = space();
    			p5 = element("p");
    			t29 = text("Gem. Art. 15 DSGVO hat jede Person das Recht, von uns eine Bestätigung\n      darüber zu verlangen, ob betreffende personenbezogene Daten verarbeitet\n      werden. Wir stellen eine Kopie der personenbezogenen Daten, die Gegenstand\n      der Verarbeitung sind zur Verfügung, soweit dadurch nicht Rechte oder\n      Freiheiten anderer Personen beeinträchtigt werden. Für alle weiteren\n      Kopien kann von uns ein angemessenes Entgelt auf der Grundlage der\n      Verwaltungskosten verlangt werden. Wird der Auskunftsantrag elektronisch\n      gestellt, so werden die Informationen von uns in einem gängigen\n      elektronischen Format zur Verfügung gestellt. Werden personenbezogene\n      Daten verarbeitet, erstreckt sich das Auskunftsrecht auf folgende\n      Informationen:");
    			t30 = space();
    			ul1 = element("ul");
    			li4 = element("li");
    			t31 = text("Verarbeitungszweck,");
    			t32 = space();
    			li5 = element("li");
    			t33 = text("Kategorien personenbezogener Daten, die verarbeitet werden,");
    			t34 = space();
    			li6 = element("li");
    			t35 = text("Empfänger oder Kategorien von Empfängern, gegenüber denen die\n        personenbezogenen Daten offengelegt worden sind oder noch offengelegt\n        werden,");
    			t36 = space();
    			li7 = element("li");
    			t37 = text("geplante Daten, für die die personenbezogenen Daten gespeichert werden.");
    			t38 = space();
    			p6 = element("p");
    			t39 = text("Weiter steht das Recht auf Berichtigung und Löschung der personenbezogenen\n      Daten oder Einschränkung der Verarbeitung sowie ein Widerspruchsrecht\n      gegen die Verarbeitung jeder betroffenen Person zu.");
    			t40 = space();
    			h44 = element("h4");
    			t41 = text("Ihre Betroffenenrechte");
    			t42 = space();
    			p7 = element("p");
    			t43 = text("Unter den angegebenen Kontaktdaten der verantwortlichen Stelle können Sie\n      jederzeit folgende Rechte ausüben:");
    			t44 = space();
    			ul2 = element("ul");
    			li8 = element("li");
    			t45 = text("Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung,");
    			t46 = space();
    			li9 = element("li");
    			t47 = text("Berichtigung unrichtiger personenbezogener Daten,");
    			t48 = space();
    			li10 = element("li");
    			t49 = text("Löschung Ihrer bei uns gespeicherten Daten,");
    			t50 = space();
    			li11 = element("li");
    			t51 = text("Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund\n        gesetzlicher Pflichten noch nicht löschen dürfen,");
    			t52 = space();
    			li12 = element("li");
    			t53 = text("Widerspruch gegen die Verarbeitung Ihrer Daten bei uns und");
    			t54 = space();
    			li13 = element("li");
    			t55 = text("Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt\n        haben oder einen Vertrag mit uns abgeschlossen haben.");
    			t56 = space();
    			p8 = element("p");
    			t57 = text("Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit\n      mit Wirkung für die Zukunft widerrufen. Sie können sich jederzeit mit\n      einer Beschwerde an die für Sie zuständige Aufsichtsbehörde wenden. Ihre\n      zuständige Aufsichtsbehörde richtet sich nach dem Bundesland Ihres\n      Wohnsitzes, Ihrer Arbeit oder der mutmaßlichen Verletzung. Eine Liste der\n      Aufsichtsbehörden (für den nichtöffentlichen Bereich) mit Anschrift finden\n      Sie unter:\n      https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html");
    			t58 = space();
    			h45 = element("h4");
    			t59 = text("SSL-Verschlüsselung");
    			t60 = space();
    			p9 = element("p");
    			t61 = text("Um die Sicherheit Ihrer Daten bei der Übertragung zu schützen, verwenden\n      wir dem aktuellen Stand der Technik entsprechende\n      Verschlüsselungsverfahren (z. B. SSL) über HTTPS.");
    			t62 = space();
    			h46 = element("h4");
    			t63 = text("Log-Dateien");
    			t64 = space();
    			p10 = element("p");
    			t65 = text("Beim Besuch unserer Homepage werden Zugriffsdaten gespeichert. Diese Daten\n      enthalten Datum und Uhrzeit des Abrufs, Name der aufgerufenen Seite,\n      IP-Adresse, Referrer-URL, die übertragene Datenmenge und\n      Versionsinformationen zum Browser. Bei der Anonymisierung werden die\n      IP-Adressen derart verändert, dass die Einzelangaben über persönliche\n      Daten nicht mehr bestimmbar sind und einer natürlichen Person nicht mehr\n      zu geordnet werden können.");
    			t66 = space();
    			h47 = element("h4");
    			t67 = text("Cookies");
    			t68 = space();
    			p11 = element("p");
    			t69 = text("Die Homepage verwendet keine Cookies.");
    			t70 = space();
    			h48 = element("h4");
    			t71 = text("Änderung unserer Datenschutzbestimmungen");
    			t72 = space();
    			p12 = element("p");
    			t73 = text("Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie\n      stets den aktuellen rechtlichen Anforderungen entspricht oder um\n      Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B.\n      bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die\n      neue Datenschutzerklärung.");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-tha89x\"]", document.head);
    			meta0 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta1 = claim_element(head_nodes, "META", { name: true, content: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div0 = claim_element(nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h3 = claim_element(div0_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t1 = claim_text(h3_nodes, "Datenschutz");
    			h3_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h40 = claim_element(div1_nodes, "H4", {});
    			var h40_nodes = children(h40);
    			t3 = claim_text(h40_nodes, "Verantwortliche Stelle im Sinne der Datenschutzgesetze, insbesondere der\n      EU-Datenschutzgrundverordnung (DSGVO), ist:");
    			h40_nodes.forEach(detach_dev);
    			t4 = claim_space(div1_nodes);
    			p0 = claim_element(div1_nodes, "P", {});
    			var p0_nodes = children(p0);
    			t5 = claim_text(p0_nodes, "Damit Sie unsere angebotene Leistung zur Beratung und Vertretung in\n      Rechtsangelegenheiten in Anspruch nehmen können, erheben, verarbeiten und\n      nutzen wir personenbezogene Daten. Mit der Zustimmung zu dieser\n      Datenschutzerklärung willigen Sie in die Erhebung, Verarbeitung und\n      Nutzung Ihrer personenbezogenen Daten gemäß den nachfolgenden Bestimmungen\n      unter Beachtung des gelten der Datenschutzgrundverordnung ein. Sie können\n      Ihr einmal gegebenes Einverständnis jederzeit mit Wirkung für die Zukunft\n      widerrufen und/ oder künftigen Verwendungen Ihrer Daten widersprechen,\n      sofern die Verarbeitung und Nutzung der Daten nicht zu Zwecken der\n      Vertragsabwicklung benötigt werden. Wir löschen im Übrigen die Daten, wenn\n      etwaige gesetzliche Aufbewahrungspflichten abgelaufen sind, Sie einen\n      Löschungsanspruch geltend gemacht haben oder eine weitere Speicherung\n      nicht mehr erforderlich ist, um den ursprünglich angestrebten\n      (Vertrags-)Zweck zu erfüllen.");
    			p0_nodes.forEach(detach_dev);
    			t6 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", {});
    			var p1_nodes = children(p1);
    			t7 = claim_text(p1_nodes, "Wir erheben und verarbeiten personenbezogene Daten als Bestandsdaten nur,\n      wenn dies für die Begründung und inhaltliche Ausgestaltung oder Änderung\n      der vertraglichen Rechtsverhältnisse notwendig sind (Datenerhebungs- und\n      Verarbeitungszweck). Personenbezogene Daten als Nutzungsdaten über die\n      Inanspruchnahme unserer Homepage erheben wir nicht. Bei Eingehung eines\n      Mandatsverhältnisses oder einer Beratung werden folgende Daten erhoben,\n      verarbeitet und gespeichert: Name, Anschrift, Telefonnummer, Emailadresse,\n      gegebenenfalls bei familien- und erbrechtlichen Angelegenheiten das\n      Geburtsdatum und der Geburtsort, sowie die Staatsangehörigkeit.");
    			p1_nodes.forEach(detach_dev);
    			t8 = claim_space(div1_nodes);
    			h41 = claim_element(div1_nodes, "H4", {});
    			var h41_nodes = children(h41);
    			t9 = claim_text(h41_nodes, "Zwecke der Datenverarbeitung durch die verantwortliche Stelle und Dritte");
    			h41_nodes.forEach(detach_dev);
    			t10 = claim_space(div1_nodes);
    			p2 = claim_element(div1_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t11 = claim_text(p2_nodes, "Wir verarbeiten Ihre personenbezogenen Daten nur zu den in dieser\n      Datenschutzerklärung genannten Zwecken. Eine Übermittlung Ihrer\n      persönlichen Daten an Dritte zu anderen als den genannten Zwecken findet\n      nicht statt. Wir geben Ihre persönlichen Daten nur an Dritte weiter, wenn:");
    			p2_nodes.forEach(detach_dev);
    			t12 = claim_space(div1_nodes);
    			ul0 = claim_element(div1_nodes, "UL", {});
    			var ul0_nodes = children(ul0);
    			li0 = claim_element(ul0_nodes, "LI", {});
    			var li0_nodes = children(li0);
    			t13 = claim_text(li0_nodes, "Sie Ihre ausdrückliche Einwilligung dazu erteilt haben,");
    			li0_nodes.forEach(detach_dev);
    			t14 = claim_space(ul0_nodes);
    			li1 = claim_element(ul0_nodes, "LI", {});
    			var li1_nodes = children(li1);
    			t15 = claim_text(li1_nodes, "die Verarbeitung zur Abwicklung eines Vertrags mit Ihnen erforderlich\n        ist,");
    			li1_nodes.forEach(detach_dev);
    			t16 = claim_space(ul0_nodes);
    			li2 = claim_element(ul0_nodes, "LI", {});
    			var li2_nodes = children(li2);
    			t17 = claim_text(li2_nodes, "die Verarbeitung zur Erfüllung einer rechtlichen Verpflichtung\n        erforderlich ist,");
    			li2_nodes.forEach(detach_dev);
    			t18 = claim_space(ul0_nodes);
    			li3 = claim_element(ul0_nodes, "LI", {});
    			var li3_nodes = children(li3);
    			t19 = claim_text(li3_nodes, "die Verarbeitung zur Wahrung berechtigter Interessen erforderlich ist\n        und kein Grund zur Annahme besteht, dass Sie ein überwiegendes\n        schutzwürdiges Interesse an der Nichtweitergabe Ihrer Daten haben.");
    			li3_nodes.forEach(detach_dev);
    			ul0_nodes.forEach(detach_dev);
    			t20 = claim_space(div1_nodes);
    			h42 = claim_element(div1_nodes, "H4", {});
    			var h42_nodes = children(h42);
    			t21 = claim_text(h42_nodes, "Löschung bzw. Sperrung der Daten");
    			h42_nodes.forEach(detach_dev);
    			t22 = claim_space(div1_nodes);
    			p3 = claim_element(div1_nodes, "P", {});
    			var p3_nodes = children(p3);
    			t23 = claim_text(p3_nodes, "Wir halten uns an die Grundsätze der Datenvermeidung und Datensparsamkeit.\n      Wir speichern Ihre personenbezogenen Daten daher nur so lange, wie dies\n      zur Erreichung der hier genannten Zwecke erforderlich ist oder wie es die\n      vom Gesetzgeber vorgesehenen vielfältigen Speicherfristen vorsehen. Nach\n      Fortfall des jeweiligen Zweckes bzw. Ablauf dieser Fristen werden die\n      entsprechenden Daten routinemäßig und entsprechend den gesetzlichen\n      Vorschriften gesperrt oder gelöscht.");
    			p3_nodes.forEach(detach_dev);
    			t24 = claim_space(div1_nodes);
    			p4 = claim_element(div1_nodes, "P", {});
    			var p4_nodes = children(p4);
    			t25 = claim_text(p4_nodes, "Natürlich lassen wir Ihre individuellen Wünsche in die Planungen\n      einfließen und können auch einzelne Leistungen anbieten.");
    			p4_nodes.forEach(detach_dev);
    			t26 = claim_space(div1_nodes);
    			h43 = claim_element(div1_nodes, "H4", {});
    			var h43_nodes = children(h43);
    			t27 = claim_text(h43_nodes, "Recht auf Auskunft, Löschung und Sperrung");
    			h43_nodes.forEach(detach_dev);
    			t28 = claim_space(div1_nodes);
    			p5 = claim_element(div1_nodes, "P", {});
    			var p5_nodes = children(p5);
    			t29 = claim_text(p5_nodes, "Gem. Art. 15 DSGVO hat jede Person das Recht, von uns eine Bestätigung\n      darüber zu verlangen, ob betreffende personenbezogene Daten verarbeitet\n      werden. Wir stellen eine Kopie der personenbezogenen Daten, die Gegenstand\n      der Verarbeitung sind zur Verfügung, soweit dadurch nicht Rechte oder\n      Freiheiten anderer Personen beeinträchtigt werden. Für alle weiteren\n      Kopien kann von uns ein angemessenes Entgelt auf der Grundlage der\n      Verwaltungskosten verlangt werden. Wird der Auskunftsantrag elektronisch\n      gestellt, so werden die Informationen von uns in einem gängigen\n      elektronischen Format zur Verfügung gestellt. Werden personenbezogene\n      Daten verarbeitet, erstreckt sich das Auskunftsrecht auf folgende\n      Informationen:");
    			p5_nodes.forEach(detach_dev);
    			t30 = claim_space(div1_nodes);
    			ul1 = claim_element(div1_nodes, "UL", {});
    			var ul1_nodes = children(ul1);
    			li4 = claim_element(ul1_nodes, "LI", {});
    			var li4_nodes = children(li4);
    			t31 = claim_text(li4_nodes, "Verarbeitungszweck,");
    			li4_nodes.forEach(detach_dev);
    			t32 = claim_space(ul1_nodes);
    			li5 = claim_element(ul1_nodes, "LI", {});
    			var li5_nodes = children(li5);
    			t33 = claim_text(li5_nodes, "Kategorien personenbezogener Daten, die verarbeitet werden,");
    			li5_nodes.forEach(detach_dev);
    			t34 = claim_space(ul1_nodes);
    			li6 = claim_element(ul1_nodes, "LI", {});
    			var li6_nodes = children(li6);
    			t35 = claim_text(li6_nodes, "Empfänger oder Kategorien von Empfängern, gegenüber denen die\n        personenbezogenen Daten offengelegt worden sind oder noch offengelegt\n        werden,");
    			li6_nodes.forEach(detach_dev);
    			t36 = claim_space(ul1_nodes);
    			li7 = claim_element(ul1_nodes, "LI", {});
    			var li7_nodes = children(li7);
    			t37 = claim_text(li7_nodes, "geplante Daten, für die die personenbezogenen Daten gespeichert werden.");
    			li7_nodes.forEach(detach_dev);
    			ul1_nodes.forEach(detach_dev);
    			t38 = claim_space(div1_nodes);
    			p6 = claim_element(div1_nodes, "P", {});
    			var p6_nodes = children(p6);
    			t39 = claim_text(p6_nodes, "Weiter steht das Recht auf Berichtigung und Löschung der personenbezogenen\n      Daten oder Einschränkung der Verarbeitung sowie ein Widerspruchsrecht\n      gegen die Verarbeitung jeder betroffenen Person zu.");
    			p6_nodes.forEach(detach_dev);
    			t40 = claim_space(div1_nodes);
    			h44 = claim_element(div1_nodes, "H4", {});
    			var h44_nodes = children(h44);
    			t41 = claim_text(h44_nodes, "Ihre Betroffenenrechte");
    			h44_nodes.forEach(detach_dev);
    			t42 = claim_space(div1_nodes);
    			p7 = claim_element(div1_nodes, "P", {});
    			var p7_nodes = children(p7);
    			t43 = claim_text(p7_nodes, "Unter den angegebenen Kontaktdaten der verantwortlichen Stelle können Sie\n      jederzeit folgende Rechte ausüben:");
    			p7_nodes.forEach(detach_dev);
    			t44 = claim_space(div1_nodes);
    			ul2 = claim_element(div1_nodes, "UL", {});
    			var ul2_nodes = children(ul2);
    			li8 = claim_element(ul2_nodes, "LI", {});
    			var li8_nodes = children(li8);
    			t45 = claim_text(li8_nodes, "Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung,");
    			li8_nodes.forEach(detach_dev);
    			t46 = claim_space(ul2_nodes);
    			li9 = claim_element(ul2_nodes, "LI", {});
    			var li9_nodes = children(li9);
    			t47 = claim_text(li9_nodes, "Berichtigung unrichtiger personenbezogener Daten,");
    			li9_nodes.forEach(detach_dev);
    			t48 = claim_space(ul2_nodes);
    			li10 = claim_element(ul2_nodes, "LI", {});
    			var li10_nodes = children(li10);
    			t49 = claim_text(li10_nodes, "Löschung Ihrer bei uns gespeicherten Daten,");
    			li10_nodes.forEach(detach_dev);
    			t50 = claim_space(ul2_nodes);
    			li11 = claim_element(ul2_nodes, "LI", {});
    			var li11_nodes = children(li11);
    			t51 = claim_text(li11_nodes, "Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund\n        gesetzlicher Pflichten noch nicht löschen dürfen,");
    			li11_nodes.forEach(detach_dev);
    			t52 = claim_space(ul2_nodes);
    			li12 = claim_element(ul2_nodes, "LI", {});
    			var li12_nodes = children(li12);
    			t53 = claim_text(li12_nodes, "Widerspruch gegen die Verarbeitung Ihrer Daten bei uns und");
    			li12_nodes.forEach(detach_dev);
    			t54 = claim_space(ul2_nodes);
    			li13 = claim_element(ul2_nodes, "LI", {});
    			var li13_nodes = children(li13);
    			t55 = claim_text(li13_nodes, "Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt\n        haben oder einen Vertrag mit uns abgeschlossen haben.");
    			li13_nodes.forEach(detach_dev);
    			ul2_nodes.forEach(detach_dev);
    			t56 = claim_space(div1_nodes);
    			p8 = claim_element(div1_nodes, "P", {});
    			var p8_nodes = children(p8);
    			t57 = claim_text(p8_nodes, "Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit\n      mit Wirkung für die Zukunft widerrufen. Sie können sich jederzeit mit\n      einer Beschwerde an die für Sie zuständige Aufsichtsbehörde wenden. Ihre\n      zuständige Aufsichtsbehörde richtet sich nach dem Bundesland Ihres\n      Wohnsitzes, Ihrer Arbeit oder der mutmaßlichen Verletzung. Eine Liste der\n      Aufsichtsbehörden (für den nichtöffentlichen Bereich) mit Anschrift finden\n      Sie unter:\n      https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html");
    			p8_nodes.forEach(detach_dev);
    			t58 = claim_space(div1_nodes);
    			h45 = claim_element(div1_nodes, "H4", {});
    			var h45_nodes = children(h45);
    			t59 = claim_text(h45_nodes, "SSL-Verschlüsselung");
    			h45_nodes.forEach(detach_dev);
    			t60 = claim_space(div1_nodes);
    			p9 = claim_element(div1_nodes, "P", {});
    			var p9_nodes = children(p9);
    			t61 = claim_text(p9_nodes, "Um die Sicherheit Ihrer Daten bei der Übertragung zu schützen, verwenden\n      wir dem aktuellen Stand der Technik entsprechende\n      Verschlüsselungsverfahren (z. B. SSL) über HTTPS.");
    			p9_nodes.forEach(detach_dev);
    			t62 = claim_space(div1_nodes);
    			h46 = claim_element(div1_nodes, "H4", {});
    			var h46_nodes = children(h46);
    			t63 = claim_text(h46_nodes, "Log-Dateien");
    			h46_nodes.forEach(detach_dev);
    			t64 = claim_space(div1_nodes);
    			p10 = claim_element(div1_nodes, "P", {});
    			var p10_nodes = children(p10);
    			t65 = claim_text(p10_nodes, "Beim Besuch unserer Homepage werden Zugriffsdaten gespeichert. Diese Daten\n      enthalten Datum und Uhrzeit des Abrufs, Name der aufgerufenen Seite,\n      IP-Adresse, Referrer-URL, die übertragene Datenmenge und\n      Versionsinformationen zum Browser. Bei der Anonymisierung werden die\n      IP-Adressen derart verändert, dass die Einzelangaben über persönliche\n      Daten nicht mehr bestimmbar sind und einer natürlichen Person nicht mehr\n      zu geordnet werden können.");
    			p10_nodes.forEach(detach_dev);
    			t66 = claim_space(div1_nodes);
    			h47 = claim_element(div1_nodes, "H4", {});
    			var h47_nodes = children(h47);
    			t67 = claim_text(h47_nodes, "Cookies");
    			h47_nodes.forEach(detach_dev);
    			t68 = claim_space(div1_nodes);
    			p11 = claim_element(div1_nodes, "P", {});
    			var p11_nodes = children(p11);
    			t69 = claim_text(p11_nodes, "Die Homepage verwendet keine Cookies.");
    			p11_nodes.forEach(detach_dev);
    			t70 = claim_space(div1_nodes);
    			h48 = claim_element(div1_nodes, "H4", {});
    			var h48_nodes = children(h48);
    			t71 = claim_text(h48_nodes, "Änderung unserer Datenschutzbestimmungen");
    			h48_nodes.forEach(detach_dev);
    			t72 = claim_space(div1_nodes);
    			p12 = claim_element(div1_nodes, "P", {});
    			var p12_nodes = children(p12);
    			t73 = claim_text(p12_nodes, "Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie\n      stets den aktuellen rechtlichen Anforderungen entspricht oder um\n      Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B.\n      bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die\n      neue Datenschutzerklärung.");
    			p12_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Datenschutz - IKPH Inter-Kontakt Projekt und Handel GmbH";
    			attr_dev(meta0, "name", "description");
    			attr_dev(meta0, "content", "Datenschutz");
    			add_location(meta0, file$9, 2, 2, 90);
    			attr_dev(meta1, "name", "keywords");
    			attr_dev(meta1, "content", "");
    			add_location(meta1, file$9, 3, 2, 142);
    			add_location(h3, file$9, 7, 2, 221);
    			attr_dev(div0, "class", "page-title");
    			add_location(div0, file$9, 6, 0, 194);
    			add_location(h40, file$9, 12, 4, 297);
    			add_location(p0, file$9, 16, 4, 445);
    			add_location(p1, file$9, 32, 4, 1488);
    			add_location(h41, file$9, 43, 4, 2201);
    			add_location(p2, file$9, 46, 4, 2299);
    			add_location(li0, file$9, 53, 6, 2629);
    			add_location(li1, file$9, 54, 6, 2700);
    			add_location(li2, file$9, 58, 6, 2814);
    			add_location(li3, file$9, 62, 6, 2934);
    			add_location(ul0, file$9, 52, 4, 2618);
    			add_location(h42, file$9, 69, 4, 3190);
    			add_location(p3, file$9, 70, 4, 3236);
    			add_location(p4, file$9, 79, 4, 3764);
    			add_location(h43, file$9, 83, 4, 3915);
    			add_location(p5, file$9, 84, 4, 3970);
    			add_location(li4, file$9, 98, 6, 4776);
    			add_location(li5, file$9, 99, 6, 4811);
    			add_location(li6, file$9, 100, 6, 4886);
    			add_location(li7, file$9, 105, 6, 5073);
    			add_location(ul1, file$9, 97, 4, 4765);
    			add_location(p6, file$9, 110, 4, 5185);
    			add_location(h44, file$9, 115, 4, 5417);
    			add_location(p7, file$9, 116, 4, 5453);
    			add_location(li8, file$9, 121, 6, 5602);
    			add_location(li9, file$9, 124, 6, 5704);
    			add_location(li10, file$9, 125, 6, 5769);
    			add_location(li11, file$9, 126, 6, 5828);
    			add_location(li12, file$9, 130, 6, 5985);
    			add_location(li13, file$9, 131, 6, 6059);
    			add_location(ul2, file$9, 120, 4, 5591);
    			add_location(p8, file$9, 136, 4, 6231);
    			add_location(h45, file$9, 146, 4, 6824);
    			add_location(p9, file$9, 147, 4, 6857);
    			add_location(h46, file$9, 152, 4, 7065);
    			add_location(p10, file$9, 153, 4, 7090);
    			add_location(h47, file$9, 162, 4, 7589);
    			add_location(p11, file$9, 163, 4, 7610);
    			add_location(h48, file$9, 164, 4, 7659);
    			add_location(p12, file$9, 165, 4, 7713);
    			attr_dev(div1, "class", "item");
    			add_location(div1, file$9, 11, 2, 274);
    			attr_dev(div2, "class", "content");
    			add_location(div2, file$9, 10, 0, 250);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h40);
    			append_dev(h40, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p0);
    			append_dev(p0, t5);
    			append_dev(div1, t6);
    			append_dev(div1, p1);
    			append_dev(p1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, h41);
    			append_dev(h41, t9);
    			append_dev(div1, t10);
    			append_dev(div1, p2);
    			append_dev(p2, t11);
    			append_dev(div1, t12);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, t13);
    			append_dev(ul0, t14);
    			append_dev(ul0, li1);
    			append_dev(li1, t15);
    			append_dev(ul0, t16);
    			append_dev(ul0, li2);
    			append_dev(li2, t17);
    			append_dev(ul0, t18);
    			append_dev(ul0, li3);
    			append_dev(li3, t19);
    			append_dev(div1, t20);
    			append_dev(div1, h42);
    			append_dev(h42, t21);
    			append_dev(div1, t22);
    			append_dev(div1, p3);
    			append_dev(p3, t23);
    			append_dev(div1, t24);
    			append_dev(div1, p4);
    			append_dev(p4, t25);
    			append_dev(div1, t26);
    			append_dev(div1, h43);
    			append_dev(h43, t27);
    			append_dev(div1, t28);
    			append_dev(div1, p5);
    			append_dev(p5, t29);
    			append_dev(div1, t30);
    			append_dev(div1, ul1);
    			append_dev(ul1, li4);
    			append_dev(li4, t31);
    			append_dev(ul1, t32);
    			append_dev(ul1, li5);
    			append_dev(li5, t33);
    			append_dev(ul1, t34);
    			append_dev(ul1, li6);
    			append_dev(li6, t35);
    			append_dev(ul1, t36);
    			append_dev(ul1, li7);
    			append_dev(li7, t37);
    			append_dev(div1, t38);
    			append_dev(div1, p6);
    			append_dev(p6, t39);
    			append_dev(div1, t40);
    			append_dev(div1, h44);
    			append_dev(h44, t41);
    			append_dev(div1, t42);
    			append_dev(div1, p7);
    			append_dev(p7, t43);
    			append_dev(div1, t44);
    			append_dev(div1, ul2);
    			append_dev(ul2, li8);
    			append_dev(li8, t45);
    			append_dev(ul2, t46);
    			append_dev(ul2, li9);
    			append_dev(li9, t47);
    			append_dev(ul2, t48);
    			append_dev(ul2, li10);
    			append_dev(li10, t49);
    			append_dev(ul2, t50);
    			append_dev(ul2, li11);
    			append_dev(li11, t51);
    			append_dev(ul2, t52);
    			append_dev(ul2, li12);
    			append_dev(li12, t53);
    			append_dev(ul2, t54);
    			append_dev(ul2, li13);
    			append_dev(li13, t55);
    			append_dev(div1, t56);
    			append_dev(div1, p8);
    			append_dev(p8, t57);
    			append_dev(div1, t58);
    			append_dev(div1, h45);
    			append_dev(h45, t59);
    			append_dev(div1, t60);
    			append_dev(div1, p9);
    			append_dev(p9, t61);
    			append_dev(div1, t62);
    			append_dev(div1, h46);
    			append_dev(h46, t63);
    			append_dev(div1, t64);
    			append_dev(div1, p10);
    			append_dev(p10, t65);
    			append_dev(div1, t66);
    			append_dev(div1, h47);
    			append_dev(h47, t67);
    			append_dev(div1, t68);
    			append_dev(div1, p11);
    			append_dev(p11, t69);
    			append_dev(div1, t70);
    			append_dev(div1, h48);
    			append_dev(h48, t71);
    			append_dev(div1, t72);
    			append_dev(div1, p12);
    			append_dev(p12, t73);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Datenschutz> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Datenschutz", $$slots, []);
    	return [];
    }

    class Datenschutz extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Datenschutz",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/pages/impressum.svelte generated by Svelte v3.19.2 */

    const file$a = "src/pages/impressum.svelte";

    function create_fragment$b(ctx) {
    	let meta0;
    	let meta1;
    	let t0;
    	let div0;
    	let h30;
    	let t1;
    	let t2;
    	let div5;
    	let div4;
    	let div1;
    	let h20;
    	let strong0;
    	let t3;
    	let t4;
    	let p0;
    	let t5;
    	let t6;
    	let h21;
    	let strong1;
    	let t7;
    	let t8;
    	let p1;
    	let t9;
    	let t10;
    	let h22;
    	let strong2;
    	let t11;
    	let t12;
    	let p2;
    	let t13;
    	let t14;
    	let h23;
    	let strong3;
    	let t15;
    	let t16;
    	let p3;
    	let t17;
    	let t18;
    	let div3;
    	let h31;
    	let t19;
    	let t20;
    	let h24;
    	let t21;
    	let t22;
    	let h25;
    	let t23;
    	let t24;
    	let p4;
    	let t25;
    	let t26;
    	let h26;
    	let t27;
    	let t28;
    	let div2;
    	let h32;
    	let t29;
    	let t30;
    	let strong4;
    	let t31;
    	let t32;
    	let strong5;
    	let t33;
    	let t34;
    	let strong6;
    	let t35;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			t0 = space();
    			div0 = element("div");
    			h30 = element("h3");
    			t1 = text("Impressum");
    			t2 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			h20 = element("h2");
    			strong0 = element("strong");
    			t3 = text("Firmen Name:");
    			t4 = space();
    			p0 = element("p");
    			t5 = text("IKPH Inter-Kontakt Projekt & Handel GmbH Altonaer Str 59-61, 13581,\n        Berlin");
    			t6 = space();
    			h21 = element("h2");
    			strong1 = element("strong");
    			t7 = text("Finanzamt Daten:");
    			t8 = space();
    			p1 = element("p");
    			t9 = text("Steuernummer 30/357/50510 Ust-id Nr DE287752857");
    			t10 = space();
    			h22 = element("h2");
    			strong2 = element("strong");
    			t11 = text("Amtgericht:");
    			t12 = space();
    			p2 = element("p");
    			t13 = text("HRB Nr. 132353 B");
    			t14 = space();
    			h23 = element("h2");
    			strong3 = element("strong");
    			t15 = text("Geschaftsfuhrung:");
    			t16 = space();
    			p3 = element("p");
    			t17 = text("Stanislaw Korshowski");
    			t18 = space();
    			div3 = element("div");
    			h31 = element("h3");
    			t19 = text("Kontaktdaten:");
    			t20 = space();
    			h24 = element("h2");
    			t21 = text("+49 30 984 34 329");
    			t22 = space();
    			h25 = element("h2");
    			t23 = text("+49 30 984 34 327");
    			t24 = space();
    			p4 = element("p");
    			t25 = text("Email:");
    			t26 = space();
    			h26 = element("h2");
    			t27 = text("info@ikph.de");
    			t28 = space();
    			div2 = element("div");
    			h32 = element("h3");
    			t29 = text("Kontoverbindung:");
    			t30 = space();
    			strong4 = element("strong");
    			t31 = text("Postbank");
    			t32 = space();
    			strong5 = element("strong");
    			t33 = text("IBAN: DE 06 1001 0010 0561 24");
    			t34 = space();
    			strong6 = element("strong");
    			t35 = text("BIC: PBNKDEFF");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-wavns1\"]", document.head);
    			meta0 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta1 = claim_element(head_nodes, "META", { name: true, content: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div0 = claim_element(nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h30 = claim_element(div0_nodes, "H3", { class: true });
    			var h30_nodes = children(h30);
    			t1 = claim_text(h30_nodes, "Impressum");
    			h30_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			div5 = claim_element(nodes, "DIV", { class: true });
    			var div5_nodes = children(div5);
    			div4 = claim_element(div5_nodes, "DIV", { class: true });
    			var div4_nodes = children(div4);
    			div1 = claim_element(div4_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h20 = claim_element(div1_nodes, "H2", { class: true });
    			var h20_nodes = children(h20);
    			strong0 = claim_element(h20_nodes, "STRONG", { class: true });
    			var strong0_nodes = children(strong0);
    			t3 = claim_text(strong0_nodes, "Firmen Name:");
    			strong0_nodes.forEach(detach_dev);
    			h20_nodes.forEach(detach_dev);
    			t4 = claim_space(div1_nodes);
    			p0 = claim_element(div1_nodes, "P", {});
    			var p0_nodes = children(p0);
    			t5 = claim_text(p0_nodes, "IKPH Inter-Kontakt Projekt & Handel GmbH Altonaer Str 59-61, 13581,\n        Berlin");
    			p0_nodes.forEach(detach_dev);
    			t6 = claim_space(div1_nodes);
    			h21 = claim_element(div1_nodes, "H2", { class: true });
    			var h21_nodes = children(h21);
    			strong1 = claim_element(h21_nodes, "STRONG", { class: true });
    			var strong1_nodes = children(strong1);
    			t7 = claim_text(strong1_nodes, "Finanzamt Daten:");
    			strong1_nodes.forEach(detach_dev);
    			h21_nodes.forEach(detach_dev);
    			t8 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", {});
    			var p1_nodes = children(p1);
    			t9 = claim_text(p1_nodes, "Steuernummer 30/357/50510 Ust-id Nr DE287752857");
    			p1_nodes.forEach(detach_dev);
    			t10 = claim_space(div1_nodes);
    			h22 = claim_element(div1_nodes, "H2", { class: true });
    			var h22_nodes = children(h22);
    			strong2 = claim_element(h22_nodes, "STRONG", { class: true });
    			var strong2_nodes = children(strong2);
    			t11 = claim_text(strong2_nodes, "Amtgericht:");
    			strong2_nodes.forEach(detach_dev);
    			h22_nodes.forEach(detach_dev);
    			t12 = claim_space(div1_nodes);
    			p2 = claim_element(div1_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t13 = claim_text(p2_nodes, "HRB Nr. 132353 B");
    			p2_nodes.forEach(detach_dev);
    			t14 = claim_space(div1_nodes);
    			h23 = claim_element(div1_nodes, "H2", { class: true });
    			var h23_nodes = children(h23);
    			strong3 = claim_element(h23_nodes, "STRONG", { class: true });
    			var strong3_nodes = children(strong3);
    			t15 = claim_text(strong3_nodes, "Geschaftsfuhrung:");
    			strong3_nodes.forEach(detach_dev);
    			h23_nodes.forEach(detach_dev);
    			t16 = claim_space(div1_nodes);
    			p3 = claim_element(div1_nodes, "P", {});
    			var p3_nodes = children(p3);
    			t17 = claim_text(p3_nodes, "Stanislaw Korshowski");
    			p3_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t18 = claim_space(div4_nodes);
    			div3 = claim_element(div4_nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			h31 = claim_element(div3_nodes, "H3", { class: true });
    			var h31_nodes = children(h31);
    			t19 = claim_text(h31_nodes, "Kontaktdaten:");
    			h31_nodes.forEach(detach_dev);
    			t20 = claim_space(div3_nodes);
    			h24 = claim_element(div3_nodes, "H2", { class: true });
    			var h24_nodes = children(h24);
    			t21 = claim_text(h24_nodes, "+49 30 984 34 329");
    			h24_nodes.forEach(detach_dev);
    			t22 = claim_space(div3_nodes);
    			h25 = claim_element(div3_nodes, "H2", { class: true });
    			var h25_nodes = children(h25);
    			t23 = claim_text(h25_nodes, "+49 30 984 34 327");
    			h25_nodes.forEach(detach_dev);
    			t24 = claim_space(div3_nodes);
    			p4 = claim_element(div3_nodes, "P", {});
    			var p4_nodes = children(p4);
    			t25 = claim_text(p4_nodes, "Email:");
    			p4_nodes.forEach(detach_dev);
    			t26 = claim_space(div3_nodes);
    			h26 = claim_element(div3_nodes, "H2", { class: true });
    			var h26_nodes = children(h26);
    			t27 = claim_text(h26_nodes, "info@ikph.de");
    			h26_nodes.forEach(detach_dev);
    			t28 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			h32 = claim_element(div2_nodes, "H3", { class: true });
    			var h32_nodes = children(h32);
    			t29 = claim_text(h32_nodes, "Kontoverbindung:");
    			h32_nodes.forEach(detach_dev);
    			t30 = claim_space(div2_nodes);
    			strong4 = claim_element(div2_nodes, "STRONG", { class: true });
    			var strong4_nodes = children(strong4);
    			t31 = claim_text(strong4_nodes, "Postbank");
    			strong4_nodes.forEach(detach_dev);
    			t32 = claim_space(div2_nodes);
    			strong5 = claim_element(div2_nodes, "STRONG", { class: true });
    			var strong5_nodes = children(strong5);
    			t33 = claim_text(strong5_nodes, "IBAN: DE 06 1001 0010 0561 24");
    			strong5_nodes.forEach(detach_dev);
    			t34 = claim_space(div2_nodes);
    			strong6 = claim_element(div2_nodes, "STRONG", { class: true });
    			var strong6_nodes = children(strong6);
    			t35 = claim_text(strong6_nodes, "BIC: PBNKDEFF");
    			strong6_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			div4_nodes.forEach(detach_dev);
    			div5_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Impressum - IKPH Inter-Kontakt Projekt und Handel GmbH";
    			attr_dev(meta0, "name", "description");
    			attr_dev(meta0, "content", "Impressum");
    			add_location(meta0, file$a, 29, 2, 396);
    			attr_dev(meta1, "name", "keywords");
    			attr_dev(meta1, "content", "");
    			add_location(meta1, file$a, 30, 2, 446);
    			attr_dev(h30, "class", "svelte-1ns4jpm");
    			add_location(h30, file$a, 34, 2, 525);
    			attr_dev(div0, "class", "page-title");
    			add_location(div0, file$a, 33, 0, 498);
    			attr_dev(strong0, "class", "svelte-1ns4jpm");
    			add_location(strong0, file$a, 39, 10, 632);
    			attr_dev(h20, "class", "svelte-1ns4jpm");
    			add_location(h20, file$a, 39, 6, 628);
    			add_location(p0, file$a, 40, 6, 673);
    			attr_dev(strong1, "class", "svelte-1ns4jpm");
    			add_location(strong1, file$a, 44, 10, 793);
    			attr_dev(h21, "class", "svelte-1ns4jpm");
    			add_location(h21, file$a, 44, 6, 789);
    			add_location(p1, file$a, 45, 6, 838);
    			attr_dev(strong2, "class", "svelte-1ns4jpm");
    			add_location(strong2, file$a, 49, 10, 920);
    			attr_dev(h22, "class", "svelte-1ns4jpm");
    			add_location(h22, file$a, 49, 6, 916);
    			add_location(p2, file$a, 50, 6, 960);
    			attr_dev(strong3, "class", "svelte-1ns4jpm");
    			add_location(strong3, file$a, 54, 10, 1011);
    			attr_dev(h23, "class", "svelte-1ns4jpm");
    			add_location(h23, file$a, 54, 6, 1007);
    			add_location(p3, file$a, 55, 6, 1057);
    			attr_dev(div1, "class", "item svelte-1ns4jpm");
    			add_location(div1, file$a, 38, 4, 603);
    			attr_dev(h31, "class", "svelte-1ns4jpm");
    			add_location(h31, file$a, 61, 6, 1142);
    			attr_dev(h24, "class", "svelte-1ns4jpm");
    			add_location(h24, file$a, 62, 6, 1171);
    			attr_dev(h25, "class", "svelte-1ns4jpm");
    			add_location(h25, file$a, 63, 6, 1204);
    			add_location(p4, file$a, 64, 6, 1237);
    			attr_dev(h26, "class", "svelte-1ns4jpm");
    			add_location(h26, file$a, 65, 6, 1257);
    			attr_dev(h32, "class", "svelte-1ns4jpm");
    			add_location(h32, file$a, 67, 8, 1313);
    			attr_dev(strong4, "class", "svelte-1ns4jpm");
    			add_location(strong4, file$a, 68, 8, 1347);
    			attr_dev(strong5, "class", "svelte-1ns4jpm");
    			add_location(strong5, file$a, 69, 8, 1381);
    			attr_dev(strong6, "class", "svelte-1ns4jpm");
    			add_location(strong6, file$a, 70, 8, 1436);
    			attr_dev(div2, "class", "konto svelte-1ns4jpm");
    			add_location(div2, file$a, 66, 6, 1285);
    			attr_dev(div3, "class", "item svelte-1ns4jpm");
    			add_location(div3, file$a, 60, 4, 1117);
    			attr_dev(div4, "class", "impressum svelte-1ns4jpm");
    			add_location(div4, file$a, 37, 2, 575);
    			attr_dev(div5, "class", "content");
    			add_location(div5, file$a, 36, 0, 551);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h30);
    			append_dev(h30, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			append_dev(div1, h20);
    			append_dev(h20, strong0);
    			append_dev(strong0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p0);
    			append_dev(p0, t5);
    			append_dev(div1, t6);
    			append_dev(div1, h21);
    			append_dev(h21, strong1);
    			append_dev(strong1, t7);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			append_dev(p1, t9);
    			append_dev(div1, t10);
    			append_dev(div1, h22);
    			append_dev(h22, strong2);
    			append_dev(strong2, t11);
    			append_dev(div1, t12);
    			append_dev(div1, p2);
    			append_dev(p2, t13);
    			append_dev(div1, t14);
    			append_dev(div1, h23);
    			append_dev(h23, strong3);
    			append_dev(strong3, t15);
    			append_dev(div1, t16);
    			append_dev(div1, p3);
    			append_dev(p3, t17);
    			append_dev(div4, t18);
    			append_dev(div4, div3);
    			append_dev(div3, h31);
    			append_dev(h31, t19);
    			append_dev(div3, t20);
    			append_dev(div3, h24);
    			append_dev(h24, t21);
    			append_dev(div3, t22);
    			append_dev(div3, h25);
    			append_dev(h25, t23);
    			append_dev(div3, t24);
    			append_dev(div3, p4);
    			append_dev(p4, t25);
    			append_dev(div3, t26);
    			append_dev(div3, h26);
    			append_dev(h26, t27);
    			append_dev(div3, t28);
    			append_dev(div3, div2);
    			append_dev(div2, h32);
    			append_dev(h32, t29);
    			append_dev(div2, t30);
    			append_dev(div2, strong4);
    			append_dev(strong4, t31);
    			append_dev(div2, t32);
    			append_dev(div2, strong5);
    			append_dev(strong5, t33);
    			append_dev(div2, t34);
    			append_dev(div2, strong6);
    			append_dev(strong6, t35);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Impressum> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Impressum", $$slots, []);
    	return [];
    }

    class Impressum extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Impressum",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.19.2 */
    const file$b = "src/pages/index.svelte";

    function create_fragment$c(ctx) {
    	let meta0;
    	let meta1;
    	let t0;
    	let t1;
    	let div2;
    	let div0;
    	let img;
    	let img_src_value;
    	let t2;
    	let div1;
    	let h3;
    	let t3;
    	let br;
    	let t4;
    	let t5;
    	let h4;
    	let t6;
    	let t7;
    	let p0;
    	let t8;
    	let t9;
    	let p1;
    	let t10;
    	let t11;
    	let p2;
    	let t12;
    	let t13;
    	let p3;
    	let t14;
    	let t15;
    	let p4;
    	let t16;
    	let t17;
    	let p5;
    	let t18;
    	let t19;
    	let p6;
    	let t20;
    	let current;
    	const hero = new Hero({ $$inline: true });

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			t0 = space();
    			create_component(hero.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			div1 = element("div");
    			h3 = element("h3");
    			t3 = text("Herzlich willkommen auf der\n        ");
    			br = element("br");
    			t4 = text("\n        Internetseite Ihres IKPH Teams");
    			t5 = space();
    			h4 = element("h4");
    			t6 = text("Alles aus einer Hand!");
    			t7 = space();
    			p0 = element("p");
    			t8 = text("Obwohl unsere Unternehmen erst seit wenigen Jahren auf dem Markt ist,\n      haben wir hohe Qualitätsstandards erreicht.");
    			t9 = space();
    			p1 = element("p");
    			t10 = text("Unsere Firma beschäftigt sich mit Renovierungen und Innenausbau. Des\n      Weiteren mit der Realisierung von Aufträgen großer Hausverwaltungen und\n      Investoren.");
    			t11 = space();
    			p2 = element("p");
    			t12 = text("Wir haben hohe Qualitätsstandards etabliert, um auch die kompliziertesten\n      Aufträge fach- und termingerecht zu realisieren.");
    			t13 = space();
    			p3 = element("p");
    			t14 = text("Ob Altbau oder Neubau, ob Gewerbe, Wohnung oder komplette Wohnanlage\n      übernehmen wir alle Sanierungsarbeiten. Beratung und Planung bis zur\n      Ausführung, bei uns, bekommen Sie alle Leistungen aus einer Hand.");
    			t15 = space();
    			p4 = element("p");
    			t16 = text("Dabei können Sie sich der professionellen Umsetzung und der reibungslosen\n      Kommunikation sicher sein. Unser Team wird Sie vor Ort beraten und Ihre\n      Fragen beantworten.");
    			t17 = space();
    			p5 = element("p");
    			t18 = text("Wir sind schnell, sauber und zuverlässig!");
    			t19 = space();
    			p6 = element("p");
    			t20 = text("Ihr IKPH Team.");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-95u88e\"]", document.head);
    			meta0 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta1 = claim_element(head_nodes, "META", { name: true, content: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			claim_component(hero.$$.fragment, nodes);
    			t1 = claim_space(nodes);
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div0 = claim_element(div2_nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			img = claim_element(div0_nodes, "IMG", { src: true, alt: true });
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(div2_nodes);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			h3 = claim_element(div1_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t3 = claim_text(h3_nodes, "Herzlich willkommen auf der\n        ");
    			br = claim_element(h3_nodes, "BR", {});
    			t4 = claim_text(h3_nodes, "\n        Internetseite Ihres IKPH Teams");
    			h3_nodes.forEach(detach_dev);
    			t5 = claim_space(div1_nodes);
    			h4 = claim_element(div1_nodes, "H4", {});
    			var h4_nodes = children(h4);
    			t6 = claim_text(h4_nodes, "Alles aus einer Hand!");
    			h4_nodes.forEach(detach_dev);
    			t7 = claim_space(div1_nodes);
    			p0 = claim_element(div1_nodes, "P", {});
    			var p0_nodes = children(p0);
    			t8 = claim_text(p0_nodes, "Obwohl unsere Unternehmen erst seit wenigen Jahren auf dem Markt ist,\n      haben wir hohe Qualitätsstandards erreicht.");
    			p0_nodes.forEach(detach_dev);
    			t9 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", {});
    			var p1_nodes = children(p1);
    			t10 = claim_text(p1_nodes, "Unsere Firma beschäftigt sich mit Renovierungen und Innenausbau. Des\n      Weiteren mit der Realisierung von Aufträgen großer Hausverwaltungen und\n      Investoren.");
    			p1_nodes.forEach(detach_dev);
    			t11 = claim_space(div1_nodes);
    			p2 = claim_element(div1_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t12 = claim_text(p2_nodes, "Wir haben hohe Qualitätsstandards etabliert, um auch die kompliziertesten\n      Aufträge fach- und termingerecht zu realisieren.");
    			p2_nodes.forEach(detach_dev);
    			t13 = claim_space(div1_nodes);
    			p3 = claim_element(div1_nodes, "P", {});
    			var p3_nodes = children(p3);
    			t14 = claim_text(p3_nodes, "Ob Altbau oder Neubau, ob Gewerbe, Wohnung oder komplette Wohnanlage\n      übernehmen wir alle Sanierungsarbeiten. Beratung und Planung bis zur\n      Ausführung, bei uns, bekommen Sie alle Leistungen aus einer Hand.");
    			p3_nodes.forEach(detach_dev);
    			t15 = claim_space(div1_nodes);
    			p4 = claim_element(div1_nodes, "P", {});
    			var p4_nodes = children(p4);
    			t16 = claim_text(p4_nodes, "Dabei können Sie sich der professionellen Umsetzung und der reibungslosen\n      Kommunikation sicher sein. Unser Team wird Sie vor Ort beraten und Ihre\n      Fragen beantworten.");
    			p4_nodes.forEach(detach_dev);
    			t17 = claim_space(div1_nodes);
    			p5 = claim_element(div1_nodes, "P", {});
    			var p5_nodes = children(p5);
    			t18 = claim_text(p5_nodes, "Wir sind schnell, sauber und zuverlässig!");
    			p5_nodes.forEach(detach_dev);
    			t19 = claim_space(div1_nodes);
    			p6 = claim_element(div1_nodes, "P", {});
    			var p6_nodes = children(p6);
    			t20 = claim_text(p6_nodes, "Ihr IKPH Team.");
    			p6_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Startseite - IKPH Inter-Kontakt Projekt und Handel GmbH";
    			attr_dev(meta0, "name", "description");
    			attr_dev(meta0, "content", "Herzlich willkommen auf der Internetseite Ihres IKPH Teams");
    			add_location(meta0, file$b, 86, 2, 1597);
    			attr_dev(meta1, "name", "keywords");
    			attr_dev(meta1, "content", "");
    			add_location(meta1, file$b, 89, 2, 1704);
    			if (img.src !== (img_src_value = "g/images/house.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Inter-Kontakt Projekt und Handel GmbH");
    			add_location(img, file$b, 96, 4, 1813);
    			attr_dev(div0, "class", "item");
    			add_location(div0, file$b, 95, 2, 1790);
    			add_location(br, file$b, 102, 8, 1976);
    			add_location(h3, file$b, 100, 6, 1927);
    			add_location(h4, file$b, 105, 4, 2038);
    			add_location(p0, file$b, 106, 4, 2073);
    			add_location(p1, file$b, 110, 4, 2216);
    			add_location(p2, file$b, 115, 4, 2404);
    			add_location(p3, file$b, 119, 4, 2556);
    			add_location(p4, file$b, 124, 4, 2795);
    			add_location(p5, file$b, 129, 4, 2996);
    			add_location(p6, file$b, 130, 4, 3049);
    			attr_dev(div1, "class", "item");
    			add_location(div1, file$b, 99, 2, 1902);
    			attr_dev(div2, "class", "content");
    			add_location(div2, file$b, 94, 0, 1766);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			insert_dev(target, t0, anchor);
    			mount_component(hero, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, img);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(h3, t3);
    			append_dev(h3, br);
    			append_dev(h3, t4);
    			append_dev(div1, t5);
    			append_dev(div1, h4);
    			append_dev(h4, t6);
    			append_dev(div1, t7);
    			append_dev(div1, p0);
    			append_dev(p0, t8);
    			append_dev(div1, t9);
    			append_dev(div1, p1);
    			append_dev(p1, t10);
    			append_dev(div1, t11);
    			append_dev(div1, p2);
    			append_dev(p2, t12);
    			append_dev(div1, t13);
    			append_dev(div1, p3);
    			append_dev(p3, t14);
    			append_dev(div1, t15);
    			append_dev(div1, p4);
    			append_dev(p4, t16);
    			append_dev(div1, t17);
    			append_dev(div1, p5);
    			append_dev(p5, t18);
    			append_dev(div1, t19);
    			append_dev(div1, p6);
    			append_dev(p6, t20);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(hero.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(hero.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			if (detaching) detach_dev(t0);
    			destroy_component(hero, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pages", $$slots, []);
    	$$self.$capture_state = () => ({ Hero });
    	return [];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/pages/leistungen.svelte generated by Svelte v3.19.2 */

    const file$c = "src/pages/leistungen.svelte";

    function create_fragment$d(ctx) {
    	let meta0;
    	let meta1;
    	let t0;
    	let div0;
    	let h3;
    	let t1;
    	let t2;
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t3;
    	let div2;
    	let p0;
    	let t4;
    	let t5;
    	let p1;
    	let t6;
    	let t7;
    	let p2;
    	let t8;
    	let t9;
    	let ul;
    	let li0;
    	let t10;
    	let t11;
    	let li1;
    	let t12;
    	let t13;
    	let li2;
    	let t14;
    	let t15;
    	let li3;
    	let t16;
    	let t17;
    	let li4;
    	let t18;
    	let t19;
    	let li5;
    	let t20;
    	let t21;
    	let li6;
    	let t22;
    	let t23;
    	let p3;
    	let t24;
    	let t25;
    	let p4;
    	let t26;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text("Leistungen");
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t3 = space();
    			div2 = element("div");
    			p0 = element("p");
    			t4 = text("Verantwortliche Steuerung und Sicherstellung von Bauprojekten, von der\n      Wohnungssanierung bis hin zu Großbauprojekten für alle Immobilienklassen,\n      ist unsere Stärke.");
    			t5 = space();
    			p1 = element("p");
    			t6 = text("Hier sind unsere Leistungen im Überblick.");
    			t7 = space();
    			p2 = element("p");
    			t8 = text("Gewerke:");
    			t9 = space();
    			ul = element("ul");
    			li0 = element("li");
    			t10 = text("Elektro: komplette Verlegung aller Leitungen, Installationen u.a. von\n        Digitalzählermit VDE- Elektroprüfprotokoll, Schalter und Steckdosen und\n        Lampenfassungen.");
    			t11 = space();
    			li1 = element("li");
    			t12 = text("Sanitär: in diesem Bereich decken wir das gesamt Spektrum ab, Bad,\n        Küche, Nassstrecke, incl. Toiletten, Armaturen, Wasseranschlüsse,\n        Waschbecken, Dichtungen.");
    			t13 = space();
    			li2 = element("li");
    			t14 = text("Fliesen: Verlegen, Abdichtungen, Ausgleich, Einbringungen von x-el-\n        Bändern, Rohrmanschetten, Anschlüsse, Verfugen, Silikonarbeitend.\n        Heizung und Warmwasser Bau, Erstellung, Umbau und Reinigungen,\n        Heizkörpernach DIN-Normen incl. Rohrlegearbeiten, Schweißen u. a.m.");
    			t15 = space();
    			li3 = element("li");
    			t16 = text("Trockenbau: Erstellung, Neubau, Umbau, Rekonstruktionen nach Q2, Q3\n        Spachteln und Schleifen, Ständerwerke.");
    			t17 = space();
    			li4 = element("li");
    			t18 = text("Alle Maler-und Lackierungsarbeiten nach Q2, Q3, Q4.");
    			t19 = space();
    			li5 = element("li");
    			t20 = text("BBodenbelagsarbeiten: fachgerechtes Verlegen von Parkett und Laminat,\n        Abziehen und Versiegeln.");
    			t21 = space();
    			li6 = element("li");
    			t22 = text("Fenster: Montage von Fenstern entsprechend der Vorgaben und Normen,\n        inklusive Ausbau und Entsorgung der alten Fenster.");
    			t23 = space();
    			p3 = element("p");
    			t24 = text("Zu unserem Leistungsangebot gehört auch,auf Wunsch, die Recherche, Ankauf\n      und Transport der Materialien, selbstverständlich auch die Reinigung.");
    			t25 = space();
    			p4 = element("p");
    			t26 = text("Ihr IKPH Team.");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-14l7syn\"]", document.head);
    			meta0 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta1 = claim_element(head_nodes, "META", { name: true, content: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div0 = claim_element(nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h3 = claim_element(div0_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t1 = claim_text(h3_nodes, "Leistungen");
    			h3_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			div3 = claim_element(nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div1 = claim_element(div3_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			img = claim_element(div1_nodes, "IMG", { src: true, alt: true });
    			div1_nodes.forEach(detach_dev);
    			t3 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			p0 = claim_element(div2_nodes, "P", {});
    			var p0_nodes = children(p0);
    			t4 = claim_text(p0_nodes, "Verantwortliche Steuerung und Sicherstellung von Bauprojekten, von der\n      Wohnungssanierung bis hin zu Großbauprojekten für alle Immobilienklassen,\n      ist unsere Stärke.");
    			p0_nodes.forEach(detach_dev);
    			t5 = claim_space(div2_nodes);
    			p1 = claim_element(div2_nodes, "P", {});
    			var p1_nodes = children(p1);
    			t6 = claim_text(p1_nodes, "Hier sind unsere Leistungen im Überblick.");
    			p1_nodes.forEach(detach_dev);
    			t7 = claim_space(div2_nodes);
    			p2 = claim_element(div2_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t8 = claim_text(p2_nodes, "Gewerke:");
    			p2_nodes.forEach(detach_dev);
    			t9 = claim_space(div2_nodes);
    			ul = claim_element(div2_nodes, "UL", {});
    			var ul_nodes = children(ul);
    			li0 = claim_element(ul_nodes, "LI", {});
    			var li0_nodes = children(li0);
    			t10 = claim_text(li0_nodes, "Elektro: komplette Verlegung aller Leitungen, Installationen u.a. von\n        Digitalzählermit VDE- Elektroprüfprotokoll, Schalter und Steckdosen und\n        Lampenfassungen.");
    			li0_nodes.forEach(detach_dev);
    			t11 = claim_space(ul_nodes);
    			li1 = claim_element(ul_nodes, "LI", {});
    			var li1_nodes = children(li1);
    			t12 = claim_text(li1_nodes, "Sanitär: in diesem Bereich decken wir das gesamt Spektrum ab, Bad,\n        Küche, Nassstrecke, incl. Toiletten, Armaturen, Wasseranschlüsse,\n        Waschbecken, Dichtungen.");
    			li1_nodes.forEach(detach_dev);
    			t13 = claim_space(ul_nodes);
    			li2 = claim_element(ul_nodes, "LI", {});
    			var li2_nodes = children(li2);
    			t14 = claim_text(li2_nodes, "Fliesen: Verlegen, Abdichtungen, Ausgleich, Einbringungen von x-el-\n        Bändern, Rohrmanschetten, Anschlüsse, Verfugen, Silikonarbeitend.\n        Heizung und Warmwasser Bau, Erstellung, Umbau und Reinigungen,\n        Heizkörpernach DIN-Normen incl. Rohrlegearbeiten, Schweißen u. a.m.");
    			li2_nodes.forEach(detach_dev);
    			t15 = claim_space(ul_nodes);
    			li3 = claim_element(ul_nodes, "LI", {});
    			var li3_nodes = children(li3);
    			t16 = claim_text(li3_nodes, "Trockenbau: Erstellung, Neubau, Umbau, Rekonstruktionen nach Q2, Q3\n        Spachteln und Schleifen, Ständerwerke.");
    			li3_nodes.forEach(detach_dev);
    			t17 = claim_space(ul_nodes);
    			li4 = claim_element(ul_nodes, "LI", {});
    			var li4_nodes = children(li4);
    			t18 = claim_text(li4_nodes, "Alle Maler-und Lackierungsarbeiten nach Q2, Q3, Q4.");
    			li4_nodes.forEach(detach_dev);
    			t19 = claim_space(ul_nodes);
    			li5 = claim_element(ul_nodes, "LI", {});
    			var li5_nodes = children(li5);
    			t20 = claim_text(li5_nodes, "BBodenbelagsarbeiten: fachgerechtes Verlegen von Parkett und Laminat,\n        Abziehen und Versiegeln.");
    			li5_nodes.forEach(detach_dev);
    			t21 = claim_space(ul_nodes);
    			li6 = claim_element(ul_nodes, "LI", {});
    			var li6_nodes = children(li6);
    			t22 = claim_text(li6_nodes, "Fenster: Montage von Fenstern entsprechend der Vorgaben und Normen,\n        inklusive Ausbau und Entsorgung der alten Fenster.");
    			li6_nodes.forEach(detach_dev);
    			ul_nodes.forEach(detach_dev);
    			t23 = claim_space(div2_nodes);
    			p3 = claim_element(div2_nodes, "P", {});
    			var p3_nodes = children(p3);
    			t24 = claim_text(p3_nodes, "Zu unserem Leistungsangebot gehört auch,auf Wunsch, die Recherche, Ankauf\n      und Transport der Materialien, selbstverständlich auch die Reinigung.");
    			p3_nodes.forEach(detach_dev);
    			t25 = claim_space(div2_nodes);
    			p4 = claim_element(div2_nodes, "P", {});
    			var p4_nodes = children(p4);
    			t26 = claim_text(p4_nodes, "Ihr IKPH Team.");
    			p4_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Leistungen - IKPH Inter-Kontakt Projekt und Handel GmbH";
    			attr_dev(meta0, "name", "description");
    			attr_dev(meta0, "content", "Leistungen");
    			add_location(meta0, file$c, 6, 2, 110);
    			attr_dev(meta1, "name", "keywords");
    			attr_dev(meta1, "content", "");
    			add_location(meta1, file$c, 7, 2, 161);
    			add_location(h3, file$c, 12, 2, 241);
    			attr_dev(div0, "class", "page-title");
    			add_location(div0, file$c, 10, 0, 213);
    			if (img.src !== (img_src_value = "g/images/services.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Leistungen");
    			add_location(img, file$c, 16, 4, 315);
    			attr_dev(div1, "class", "item");
    			add_location(div1, file$c, 15, 2, 292);
    			add_location(p0, file$c, 19, 4, 400);
    			add_location(p1, file$c, 24, 4, 599);
    			add_location(p2, file$c, 25, 4, 652);
    			add_location(li0, file$c, 27, 6, 683);
    			add_location(li1, file$c, 32, 6, 889);
    			add_location(li2, file$c, 37, 6, 1094);
    			add_location(li3, file$c, 43, 6, 1414);
    			add_location(li4, file$c, 47, 6, 1560);
    			add_location(li5, file$c, 48, 6, 1627);
    			add_location(li6, file$c, 52, 6, 1761);
    			add_location(ul, file$c, 26, 4, 672);
    			add_location(p3, file$c, 57, 4, 1927);
    			add_location(p4, file$c, 61, 4, 2100);
    			attr_dev(div2, "class", "item");
    			add_location(div2, file$c, 18, 2, 377);
    			attr_dev(div3, "class", "content");
    			add_location(div3, file$c, 14, 0, 268);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(p0, t4);
    			append_dev(div2, t5);
    			append_dev(div2, p1);
    			append_dev(p1, t6);
    			append_dev(div2, t7);
    			append_dev(div2, p2);
    			append_dev(p2, t8);
    			append_dev(div2, t9);
    			append_dev(div2, ul);
    			append_dev(ul, li0);
    			append_dev(li0, t10);
    			append_dev(ul, t11);
    			append_dev(ul, li1);
    			append_dev(li1, t12);
    			append_dev(ul, t13);
    			append_dev(ul, li2);
    			append_dev(li2, t14);
    			append_dev(ul, t15);
    			append_dev(ul, li3);
    			append_dev(li3, t16);
    			append_dev(ul, t17);
    			append_dev(ul, li4);
    			append_dev(li4, t18);
    			append_dev(ul, t19);
    			append_dev(ul, li5);
    			append_dev(li5, t20);
    			append_dev(ul, t21);
    			append_dev(ul, li6);
    			append_dev(li6, t22);
    			append_dev(div2, t23);
    			append_dev(div2, p3);
    			append_dev(p3, t24);
    			append_dev(div2, t25);
    			append_dev(div2, p4);
    			append_dev(p4, t26);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Leistungen> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Leistungen", $$slots, []);
    	return [];
    }

    class Leistungen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Leistungen",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/pages/referenzen.svelte generated by Svelte v3.19.2 */
    const file$d = "src/pages/referenzen.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (49:4) {#each images as image, i ('imagen_' + i)}
    function create_each_block$4(key_1, ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*i*/ ctx[6], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			this.h();
    		},
    		l: function claim(nodes) {
    			div = claim_element(nodes, "DIV", { class: true });
    			var div_nodes = children(div);
    			img = claim_element(div_nodes, "IMG", { src: true, alt: true, class: true });
    			t = claim_space(div_nodes);
    			div_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			if (img.src !== (img_src_value = /*image*/ ctx[4].small)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*image*/ ctx[4].title);
    			attr_dev(img, "class", "svelte-6bbnfq");
    			add_location(img, file$d, 50, 8, 952);
    			attr_dev(div, "class", "photo svelte-6bbnfq");
    			add_location(div, file$d, 49, 6, 924);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    			dispose = listen_dev(img, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(49:4) {#each images as image, i ('imagen_' + i)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let meta0;
    	let meta1;
    	let t0;
    	let div0;
    	let h3;
    	let t1;
    	let t2;
    	let div2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t3;
    	let current;
    	let each_value = /*images*/ ctx[2];
    	validate_each_argument(each_value);
    	const get_key = ctx => "imagen_" + /*i*/ ctx[6];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	const lightbox = new LightBox({
    			props: {
    				content: /*images*/ ctx[2],
    				go: /*go*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text("Referenzen");
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			create_component(lightbox.$$.fragment);
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-1cibnjy\"]", document.head);
    			meta0 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta1 = claim_element(head_nodes, "META", { name: true, content: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div0 = claim_element(nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h3 = claim_element(div0_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t1 = claim_text(h3_nodes, "Referenzen");
    			h3_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			div2 = claim_element(nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			div1 = claim_element(div2_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].l(div1_nodes);
    			}

    			div1_nodes.forEach(detach_dev);
    			div2_nodes.forEach(detach_dev);
    			t3 = claim_space(nodes);
    			claim_component(lightbox.$$.fragment, nodes);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Referenzen - IKPH Inter-Kontakt Projekt und Handel GmbH";
    			attr_dev(meta0, "name", "description");
    			attr_dev(meta0, "content", "Über uns");
    			add_location(meta0, file$d, 38, 2, 663);
    			attr_dev(meta1, "name", "keywords");
    			attr_dev(meta1, "content", "");
    			add_location(meta1, file$d, 39, 2, 712);
    			add_location(h3, file$d, 44, 2, 792);
    			attr_dev(div0, "class", "page-title");
    			add_location(div0, file$d, 42, 0, 764);
    			attr_dev(div1, "class", "photo-gallery svelte-6bbnfq");
    			add_location(div1, file$d, 47, 2, 843);
    			attr_dev(div2, "class", "content");
    			add_location(div2, file$d, 46, 0, 819);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t3, anchor);
    			mount_component(lightbox, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*images, openLightBox*/ 6) {
    				const each_value = /*images*/ ctx[2];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, destroy_block, create_each_block$4, null, get_each_context$4);
    			}

    			const lightbox_changes = {};
    			if (dirty & /*go*/ 1) lightbox_changes.go = /*go*/ ctx[0];
    			lightbox.$set(lightbox_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(lightbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(lightbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t3);
    			destroy_component(lightbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let go;

    	const openLightBox = i => {
    		$$invalidate(0, go = null);
    		setTimeout(() => $$invalidate(0, go = i));
    	};

    	let images = Array(26).fill(1).map((e, i) => ({
    		small: `./gallery/${i}.jpg`,
    		full: `./gallery/${i}.jpg`
    	}));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Referenzen> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Referenzen", $$slots, []);
    	const click_handler = i => openLightBox(i);
    	$$self.$capture_state = () => ({ LightBox, go, openLightBox, images });

    	$$self.$inject_state = $$props => {
    		if ("go" in $$props) $$invalidate(0, go = $$props.go);
    		if ("images" in $$props) $$invalidate(2, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [go, openLightBox, images, click_handler];
    }

    class Referenzen extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Referenzen",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/pages/uberuns.svelte generated by Svelte v3.19.2 */

    const file$e = "src/pages/uberuns.svelte";

    function create_fragment$f(ctx) {
    	let meta0;
    	let meta1;
    	let t0;
    	let div0;
    	let h3;
    	let t1;
    	let t2;
    	let div3;
    	let div1;
    	let p0;
    	let t3;
    	let t4;
    	let p1;
    	let t5;
    	let t6;
    	let p2;
    	let t7;
    	let t8;
    	let p3;
    	let t9;
    	let t10;
    	let p4;
    	let t11;
    	let t12;
    	let p5;
    	let t13;
    	let t14;
    	let p6;
    	let t15;
    	let t16;
    	let div2;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			t0 = space();
    			div0 = element("div");
    			h3 = element("h3");
    			t1 = text("Über uns");
    			t2 = space();
    			div3 = element("div");
    			div1 = element("div");
    			p0 = element("p");
    			t3 = text("Der Wert von Immobilien steigt unaufhörlich und deshalb ist es wichtig,\n      diese Immobilien in regelmäßigen Abständen zu warten und zu sanieren. Seit\n      drei Jahren sind wir im Bereich sach- und fachgerechter\n      Komplettrenovierung und Sanierung von Altbau oder Neubau, Gewerbe,\n      Wohnungen oder kompletten Wohnanlagen tätig.");
    			t4 = space();
    			p1 = element("p");
    			t5 = text("Unsere Firma war für HV, wie Vonovia ADO u.a. über mehre Jahren\n      erfolgreich tätig. Aber auch für unsere Privatkunden sind wir gerne\n      unterwegs.");
    			t6 = space();
    			p2 = element("p");
    			t7 = text("Wir bieten daher nicht nur komplette Wohnungssanierungen, sondern auch\n      Teilsanierungen an, um Ihre Wohnungen in einen zeitgemäßen und\n      vermietbaren Standard zu versetzen.");
    			t8 = space();
    			p3 = element("p");
    			t9 = text("Dabei begleiten wir Sie bei der Wohnungssanierung in allen Phasen. Von der\n      ersten Planung bis hin zum letzten Pinselstrich, erhalten Sie bei uns alle\n      Leistungen aus einer Hand.");
    			t10 = space();
    			p4 = element("p");
    			t11 = text("Natürlich lassen wir Ihre individuellen Wünsche in die Planungen\n      einfließen und können auch einzelne Leistungen anbieten.");
    			t12 = space();
    			p5 = element("p");
    			t13 = text("Auf Wunsch erstellen wir Ihnen einen Kostenvoranschlag, so dass Sie Ihr\n      Budget besser planen können.");
    			t14 = space();
    			p6 = element("p");
    			t15 = text("Nehmen Sie Kontakt zu uns auf und lassen Sie sich Ihr kostenloses,\n      persönliches Angebot erstellen.");
    			t16 = space();
    			div2 = element("div");
    			img = element("img");
    			this.h();
    		},
    		l: function claim(nodes) {
    			const head_nodes = query_selector_all("[data-svelte=\"svelte-ajwl5n\"]", document.head);
    			meta0 = claim_element(head_nodes, "META", { name: true, content: true });
    			meta1 = claim_element(head_nodes, "META", { name: true, content: true });
    			head_nodes.forEach(detach_dev);
    			t0 = claim_space(nodes);
    			div0 = claim_element(nodes, "DIV", { class: true });
    			var div0_nodes = children(div0);
    			h3 = claim_element(div0_nodes, "H3", {});
    			var h3_nodes = children(h3);
    			t1 = claim_text(h3_nodes, "Über uns");
    			h3_nodes.forEach(detach_dev);
    			div0_nodes.forEach(detach_dev);
    			t2 = claim_space(nodes);
    			div3 = claim_element(nodes, "DIV", { class: true });
    			var div3_nodes = children(div3);
    			div1 = claim_element(div3_nodes, "DIV", { class: true });
    			var div1_nodes = children(div1);
    			p0 = claim_element(div1_nodes, "P", {});
    			var p0_nodes = children(p0);
    			t3 = claim_text(p0_nodes, "Der Wert von Immobilien steigt unaufhörlich und deshalb ist es wichtig,\n      diese Immobilien in regelmäßigen Abständen zu warten und zu sanieren. Seit\n      drei Jahren sind wir im Bereich sach- und fachgerechter\n      Komplettrenovierung und Sanierung von Altbau oder Neubau, Gewerbe,\n      Wohnungen oder kompletten Wohnanlagen tätig.");
    			p0_nodes.forEach(detach_dev);
    			t4 = claim_space(div1_nodes);
    			p1 = claim_element(div1_nodes, "P", {});
    			var p1_nodes = children(p1);
    			t5 = claim_text(p1_nodes, "Unsere Firma war für HV, wie Vonovia ADO u.a. über mehre Jahren\n      erfolgreich tätig. Aber auch für unsere Privatkunden sind wir gerne\n      unterwegs.");
    			p1_nodes.forEach(detach_dev);
    			t6 = claim_space(div1_nodes);
    			p2 = claim_element(div1_nodes, "P", {});
    			var p2_nodes = children(p2);
    			t7 = claim_text(p2_nodes, "Wir bieten daher nicht nur komplette Wohnungssanierungen, sondern auch\n      Teilsanierungen an, um Ihre Wohnungen in einen zeitgemäßen und\n      vermietbaren Standard zu versetzen.");
    			p2_nodes.forEach(detach_dev);
    			t8 = claim_space(div1_nodes);
    			p3 = claim_element(div1_nodes, "P", {});
    			var p3_nodes = children(p3);
    			t9 = claim_text(p3_nodes, "Dabei begleiten wir Sie bei der Wohnungssanierung in allen Phasen. Von der\n      ersten Planung bis hin zum letzten Pinselstrich, erhalten Sie bei uns alle\n      Leistungen aus einer Hand.");
    			p3_nodes.forEach(detach_dev);
    			t10 = claim_space(div1_nodes);
    			p4 = claim_element(div1_nodes, "P", {});
    			var p4_nodes = children(p4);
    			t11 = claim_text(p4_nodes, "Natürlich lassen wir Ihre individuellen Wünsche in die Planungen\n      einfließen und können auch einzelne Leistungen anbieten.");
    			p4_nodes.forEach(detach_dev);
    			t12 = claim_space(div1_nodes);
    			p5 = claim_element(div1_nodes, "P", {});
    			var p5_nodes = children(p5);
    			t13 = claim_text(p5_nodes, "Auf Wunsch erstellen wir Ihnen einen Kostenvoranschlag, so dass Sie Ihr\n      Budget besser planen können.");
    			p5_nodes.forEach(detach_dev);
    			t14 = claim_space(div1_nodes);
    			p6 = claim_element(div1_nodes, "P", {});
    			var p6_nodes = children(p6);
    			t15 = claim_text(p6_nodes, "Nehmen Sie Kontakt zu uns auf und lassen Sie sich Ihr kostenloses,\n      persönliches Angebot erstellen.");
    			p6_nodes.forEach(detach_dev);
    			div1_nodes.forEach(detach_dev);
    			t16 = claim_space(div3_nodes);
    			div2 = claim_element(div3_nodes, "DIV", { class: true });
    			var div2_nodes = children(div2);
    			img = claim_element(div2_nodes, "IMG", { src: true, alt: true });
    			div2_nodes.forEach(detach_dev);
    			div3_nodes.forEach(detach_dev);
    			this.h();
    		},
    		h: function hydrate() {
    			document.title = "Über uns - IKPH Inter-Kontakt Projekt und Handel GmbH";
    			attr_dev(meta0, "name", "description");
    			attr_dev(meta0, "content", "Über uns");
    			add_location(meta0, file$e, 5, 2, 107);
    			attr_dev(meta1, "name", "keywords");
    			attr_dev(meta1, "content", "");
    			add_location(meta1, file$e, 6, 2, 156);
    			add_location(h3, file$e, 10, 2, 235);
    			attr_dev(div0, "class", "page-title");
    			add_location(div0, file$e, 9, 0, 208);
    			add_location(p0, file$e, 15, 4, 308);
    			add_location(p1, file$e, 22, 4, 670);
    			add_location(p2, file$e, 27, 4, 848);
    			add_location(p3, file$e, 32, 4, 1053);
    			add_location(p4, file$e, 37, 4, 1265);
    			add_location(p5, file$e, 41, 4, 1416);
    			add_location(p6, file$e, 45, 4, 1546);
    			attr_dev(div1, "class", "item");
    			add_location(div1, file$e, 14, 2, 285);
    			if (img.src !== (img_src_value = "g/images/about_us.jpg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Über uns");
    			add_location(img, file$e, 52, 4, 1705);
    			attr_dev(div2, "class", "item");
    			add_location(div2, file$e, 51, 2, 1682);
    			attr_dev(div3, "class", "content");
    			add_location(div3, file$e, 13, 0, 261);
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(h3, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(p1, t5);
    			append_dev(div1, t6);
    			append_dev(div1, p2);
    			append_dev(p2, t7);
    			append_dev(div1, t8);
    			append_dev(div1, p3);
    			append_dev(p3, t9);
    			append_dev(div1, t10);
    			append_dev(div1, p4);
    			append_dev(p4, t11);
    			append_dev(div1, t12);
    			append_dev(div1, p5);
    			append_dev(p5, t13);
    			append_dev(div1, t14);
    			append_dev(div1, p6);
    			append_dev(p6, t15);
    			append_dev(div3, t16);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Uberuns> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Uberuns", $$slots, []);
    	return [];
    }

    class Uberuns extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Uberuns",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    //layouts
    const layouts = {
      "/_layout": {
        "component": () => Layout,
        "meta": {},
        "relativeDir": "",
        "path": ""
      }
    };


    //raw routes
    const _routes = [
      {
        "component": () => Fallback,
        "meta": {},
        "isIndex": false,
        "isFallback": true,
        "hasParam": false,
        "path": "/_fallback",
        "shortPath": "",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Footer,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/components/Footer",
        "shortPath": "/components/Footer",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Header,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/components/Header",
        "shortPath": "/components/Header",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Hero,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/components/Hero",
        "shortPath": "/components/Hero",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => LightBox,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/components/LightBox",
        "shortPath": "/components/LightBox",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => PageTransitions,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/components/PageTransitions",
        "shortPath": "/components/PageTransitions",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Datenschutz,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/datenschutz",
        "shortPath": "/datenschutz",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Impressum,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/impressum",
        "shortPath": "/impressum",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Pages,
        "meta": {},
        "isIndex": true,
        "isFallback": false,
        "hasParam": false,
        "path": "/index",
        "shortPath": "",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Leistungen,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/leistungen",
        "shortPath": "/leistungen",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Referenzen,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/referenzen",
        "shortPath": "/referenzen",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Uberuns,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/uberuns",
        "shortPath": "/uberuns",
        "layouts": [
          layouts['/_layout']
        ]
      }
    ];

    //routes
    const routes$1 = buildRoutes(_routes);

    /* src/App.svelte generated by Svelte v3.19.2 */

    function create_fragment$g(ctx) {
    	let current;
    	const router = new Router({ props: { routes: routes$1 }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			claim_component(router.$$.fragment, nodes);
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Router, routes: routes$1 });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    const app = HMR(App, { target: document.body }, 'routify-app');

    return app;

}());
//# sourceMappingURL=bundle.js.map
