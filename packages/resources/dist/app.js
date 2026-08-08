(function () {
    "use strict";
    /**
     * @vue/shared v3.5.40
     * (c) 2018-present Yuxi (Evan) You and Vue contributors
     * @license MIT
     **/ function xr(e) {
        const t = Object.create(null);
        for (const n of e.split(",")) t[n] = 1;
        return (n) => n in t;
    }
    const Me = {},
        Sn = [],
        Rt = () => {},
        Gi = () => !1,
        xs = (e) =>
            e.charCodeAt(0) === 111 &&
            e.charCodeAt(1) === 110 &&
            (e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97),
        ks = (e) => e.startsWith("onUpdate:"),
        nt = Object.assign,
        kr = (e, t) => {
            const n = e.indexOf(t);
            n > -1 && e.splice(n, 1);
        },
        Rl = Object.prototype.hasOwnProperty,
        Ee = (e, t) => Rl.call(e, t),
        ue = Array.isArray,
        Cn = (e) => Vn(e) === "[object Map]",
        Zi = (e) => Vn(e) === "[object Set]",
        Qi = (e) => Vn(e) === "[object Date]",
        he = (e) => typeof e == "function",
        Ie = (e) => typeof e == "string",
        Ct = (e) => typeof e == "symbol",
        $e = (e) => e !== null && typeof e == "object",
        Yi = (e) => ($e(e) || he(e)) && he(e.then) && he(e.catch),
        eo = Object.prototype.toString,
        Vn = (e) => eo.call(e),
        Al = (e) => Vn(e).slice(8, -1),
        to = (e) => Vn(e) === "[object Object]",
        Sr = (e) =>
            Ie(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e,
        Wn = xr(
            ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted",
        ),
        Ss = (e) => {
            const t = Object.create(null);
            return (n) => t[n] || (t[n] = e(n));
        },
        $l = /-\w/g,
        at = Ss((e) => e.replace($l, (t) => t.slice(1).toUpperCase())),
        Ll = /\B([A-Z])/g,
        rn = Ss((e) => e.replace(Ll, "-$1").toLowerCase()),
        Cs = Ss((e) => e.charAt(0).toUpperCase() + e.slice(1)),
        Cr = Ss((e) => (e ? `on${Cs(e)}` : "")),
        At = (e, t) => !Object.is(e, t),
        Ts = (e, ...t) => {
            for (let n = 0; n < e.length; n++) e[n](...t);
        },
        no = (e, t, n, s = !1) => {
            Object.defineProperty(e, t, {
                configurable: !0,
                enumerable: !1,
                writable: s,
                value: n,
            });
        },
        Tr = (e) => {
            const t = parseFloat(e);
            return isNaN(t) ? e : t;
        };
    let so;
    const Es = () =>
        so ||
        (so =
            typeof globalThis < "u"
                ? globalThis
                : typeof self < "u"
                  ? self
                  : typeof window < "u"
                    ? window
                    : typeof global < "u"
                      ? global
                      : {});
    function $t(e) {
        if (ue(e)) {
            const t = {};
            for (let n = 0; n < e.length; n++) {
                const s = e[n],
                    r = Ie(s) ? jl(s) : $t(s);
                if (r) for (const i in r) t[i] = r[i];
            }
            return t;
        } else if (Ie(e) || $e(e)) return e;
    }
    const Ml = /;(?![^(]*\))/g,
        Nl = /:([^]+)/,
        Dl = /\/\*[^]*?\*\//g;
    function jl(e) {
        const t = {};
        return (
            e
                .replace(Dl, "")
                .split(Ml)
                .forEach((n) => {
                    if (n) {
                        const s = n.split(Nl);
                        s.length > 1 && (t[s[0].trim()] = s[1].trim());
                    }
                }),
            t
        );
    }
    function Le(e) {
        let t = "";
        if (Ie(e)) t = e;
        else if (ue(e))
            for (let n = 0; n < e.length; n++) {
                const s = Le(e[n]);
                s && (t += s + " ");
            }
        else if ($e(e)) for (const n in e) e[n] && (t += n + " ");
        return t.trim();
    }
    const Il = xr(
        "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",
    );
    function ro(e) {
        return !!e || e === "";
    }
    function Ul(e, t) {
        if (e.length !== t.length) return !1;
        let n = !0;
        for (let s = 0; n && s < e.length; s++) n = Er(e[s], t[s]);
        return n;
    }
    function Er(e, t) {
        if (e === t) return !0;
        let n = Qi(e),
            s = Qi(t);
        if (n || s) return n && s ? e.getTime() === t.getTime() : !1;
        if (((n = Ct(e)), (s = Ct(t)), n || s)) return e === t;
        if (((n = ue(e)), (s = ue(t)), n || s)) return n && s ? Ul(e, t) : !1;
        if (((n = $e(e)), (s = $e(t)), n || s)) {
            if (!n || !s) return !1;
            const r = Object.keys(e).length,
                i = Object.keys(t).length;
            if (r !== i) return !1;
            for (const a in e) {
                const c = e.hasOwnProperty(a),
                    u = t.hasOwnProperty(a);
                if ((c && !u) || (!c && u) || !Er(e[a], t[a])) return !1;
            }
        }
        return String(e) === String(t);
    }
    const oo = (e) => !!(e && e.__v_isRef === !0),
        X = (e) =>
            Ie(e)
                ? e
                : e == null
                  ? ""
                  : ue(e) || ($e(e) && (e.toString === eo || !he(e.toString)))
                    ? oo(e)
                        ? X(e.value)
                        : JSON.stringify(e, ao, 2)
                    : String(e),
        ao = (e, t) =>
            oo(t)
                ? ao(e, t.value)
                : Cn(t)
                  ? {
                        [`Map(${t.size})`]: [...t.entries()].reduce(
                            (n, [s, r], i) => ((n[Pr(s, i) + " =>"] = r), n),
                            {},
                        ),
                    }
                  : Zi(t)
                    ? { [`Set(${t.size})`]: [...t.values()].map((n) => Pr(n)) }
                    : Ct(t)
                      ? Pr(t)
                      : $e(t) && !ue(t) && !to(t)
                        ? String(t)
                        : t,
        Pr = (e, t = "") => {
            var n;
            return Ct(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e;
        };
    /**
     * @vue/reactivity v3.5.40
     * (c) 2018-present Yuxi (Evan) You and Vue contributors
     * @license MIT
     **/ let Xe;
    class Bl {
        constructor(t = !1) {
            ((this.detached = t),
                (this._active = !0),
                (this._on = 0),
                (this.effects = []),
                (this.cleanups = []),
                (this._isPaused = !1),
                (this._warnOnRun = !0),
                (this.__v_skip = !0),
                !t &&
                    Xe &&
                    (Xe.active
                        ? ((this.parent = Xe),
                          (this.index =
                              (Xe.scopes || (Xe.scopes = [])).push(this) - 1))
                        : ((this._active = !1), (this._warnOnRun = !1))));
        }
        get active() {
            return this._active;
        }
        pause() {
            if (this._active) {
                this._isPaused = !0;
                let t, n;
                if (this.scopes) {
                    const s = this.scopes.slice();
                    for (t = 0, n = s.length; t < n; t++) s[t].pause();
                }
                for (t = 0, n = this.effects.length; t < n; t++)
                    this.effects[t].pause();
            }
        }
        resume() {
            if (this._active && this._isPaused) {
                this._isPaused = !1;
                let t, n;
                if (this.scopes) {
                    const r = this.scopes.slice();
                    for (t = 0, n = r.length; t < n; t++) r[t].resume();
                }
                const s = this.effects.slice();
                for (t = 0, n = s.length; t < n; t++) s[t].resume();
            }
        }
        run(t) {
            if (this._active) {
                const n = Xe;
                try {
                    return ((Xe = this), t());
                } finally {
                    Xe = n;
                }
            }
        }
        on() {
            ++this._on === 1 && ((this.prevScope = Xe), (Xe = this));
        }
        off() {
            if (this._on > 0 && --this._on === 0) {
                if (Xe === this) Xe = this.prevScope;
                else {
                    let t = Xe;
                    for (; t; ) {
                        if (t.prevScope === this) {
                            t.prevScope = this.prevScope;
                            break;
                        }
                        t = t.prevScope;
                    }
                }
                this.prevScope = void 0;
            }
        }
        stop(t) {
            if (this._active) {
                this._active = !1;
                let n, s;
                for (n = 0, s = this.effects.length; n < s; n++)
                    this.effects[n].stop();
                for (
                    this.effects.length = 0, n = 0, s = this.cleanups.length;
                    n < s;
                    n++
                )
                    this.cleanups[n]();
                if (((this.cleanups.length = 0), this.scopes)) {
                    const r = this.scopes.slice();
                    for (n = 0, s = r.length; n < s; n++) r[n].stop(!0);
                    this.scopes.length = 0;
                }
                if (!this.detached && this.parent && !t) {
                    const r = this.parent.scopes.pop();
                    r &&
                        r !== this &&
                        ((this.parent.scopes[this.index] = r),
                        (r.index = this.index));
                }
                this.parent = void 0;
            }
        }
    }
    function Fl() {
        return Xe;
    }
    let De;
    const Or = new WeakSet();
    class co {
        constructor(t) {
            ((this.fn = t),
                (this.deps = void 0),
                (this.depsTail = void 0),
                (this.flags = 5),
                (this.next = void 0),
                (this.cleanup = void 0),
                (this.scheduler = void 0),
                Xe && (Xe.active ? Xe.effects.push(this) : (this.flags &= -2)));
        }
        pause() {
            this.flags |= 64;
        }
        resume() {
            this.flags & 64 &&
                ((this.flags &= -65),
                Or.has(this) && (Or.delete(this), this.trigger()));
        }
        notify() {
            (this.flags & 2 && !(this.flags & 32)) ||
                this.flags & 8 ||
                uo(this);
        }
        run() {
            if (!(this.flags & 1)) return this.fn();
            ((this.flags |= 2), mo(this), fo(this));
            const t = De,
                n = Tt;
            ((De = this), (Tt = !0));
            try {
                return this.fn();
            } finally {
                (ho(this), (De = t), (Tt = n), (this.flags &= -3));
            }
        }
        stop() {
            if (this.flags & 1) {
                for (let t = this.deps; t; t = t.nextDep) Lr(t);
                ((this.deps = this.depsTail = void 0),
                    mo(this),
                    this.onStop && this.onStop(),
                    (this.flags &= -2));
            }
        }
        trigger() {
            this.flags & 64
                ? Or.add(this)
                : this.scheduler
                  ? this.scheduler()
                  : this.runIfDirty();
        }
        runIfDirty() {
            $r(this) && this.run();
        }
        get dirty() {
            return $r(this);
        }
    }
    let lo = 0,
        Kn,
        Jn;
    function uo(e, t = !1) {
        if (((e.flags |= 8), t)) {
            ((e.next = Jn), (Jn = e));
            return;
        }
        ((e.next = Kn), (Kn = e));
    }
    function Rr() {
        lo++;
    }
    function Ar() {
        if (--lo > 0) return;
        if (Jn) {
            let t = Jn;
            for (Jn = void 0; t; ) {
                const n = t.next;
                ((t.next = void 0), (t.flags &= -9), (t = n));
            }
        }
        let e;
        for (; Kn; ) {
            let t = Kn;
            for (Kn = void 0; t; ) {
                const n = t.next;
                if (((t.next = void 0), (t.flags &= -9), t.flags & 1))
                    try {
                        t.trigger();
                    } catch (s) {
                        e || (e = s);
                    }
                t = n;
            }
        }
        if (e) throw e;
    }
    function fo(e) {
        for (let t = e.deps; t; t = t.nextDep)
            ((t.version = -1),
                (t.prevActiveLink = t.dep.activeLink),
                (t.dep.activeLink = t));
    }
    function ho(e) {
        let t,
            n = e.depsTail,
            s = n;
        for (; s; ) {
            const r = s.prevDep;
            (s.version === -1 ? (s === n && (n = r), Lr(s), Hl(s)) : (t = s),
                (s.dep.activeLink = s.prevActiveLink),
                (s.prevActiveLink = void 0),
                (s = r));
        }
        ((e.deps = t), (e.depsTail = n));
    }
    function $r(e) {
        for (let t = e.deps; t; t = t.nextDep)
            if (
                t.dep.version !== t.version ||
                (t.dep.computed &&
                    (po(t.dep.computed) || t.dep.version !== t.version))
            )
                return !0;
        return !!e._dirty;
    }
    function po(e) {
        if (
            (e.flags & 4 && !(e.flags & 16)) ||
            ((e.flags &= -17), e.globalVersion === Xn) ||
            ((e.globalVersion = Xn),
            !e.isSSR && e.flags & 128 && ((!e.deps && !e._dirty) || !$r(e)))
        )
            return;
        e.flags |= 2;
        const t = e.dep,
            n = De,
            s = Tt;
        ((De = e), (Tt = !0));
        try {
            fo(e);
            const r = e.fn(e._value);
            (t.version === 0 || At(r, e._value)) &&
                ((e.flags |= 128), (e._value = r), t.version++);
        } catch (r) {
            throw (t.version++, r);
        } finally {
            ((De = n), (Tt = s), ho(e), (e.flags &= -3));
        }
    }
    function Lr(e, t = !1) {
        const { dep: n, prevSub: s, nextSub: r } = e;
        if (
            (s && ((s.nextSub = r), (e.prevSub = void 0)),
            r && ((r.prevSub = s), (e.nextSub = void 0)),
            n.subs === e && ((n.subs = s), !s && n.computed))
        ) {
            n.computed.flags &= -5;
            for (let i = n.computed.deps; i; i = i.nextDep) Lr(i, !0);
        }
        !t && !--n.sc && n.map && n.map.delete(n.key);
    }
    function Hl(e) {
        const { prevDep: t, nextDep: n } = e;
        (t && ((t.nextDep = n), (e.prevDep = void 0)),
            n && ((n.prevDep = t), (e.nextDep = void 0)));
    }
    let Tt = !0;
    const vo = [];
    function Lt() {
        (vo.push(Tt), (Tt = !1));
    }
    function Mt() {
        const e = vo.pop();
        Tt = e === void 0 ? !0 : e;
    }
    function mo(e) {
        const { cleanup: t } = e;
        if (((e.cleanup = void 0), t)) {
            const n = De;
            De = void 0;
            try {
                t();
            } finally {
                De = n;
            }
        }
    }
    let Xn = 0;
    class ql {
        constructor(t, n) {
            ((this.sub = t),
                (this.dep = n),
                (this.version = n.version),
                (this.nextDep =
                    this.prevDep =
                    this.nextSub =
                    this.prevSub =
                    this.prevActiveLink =
                        void 0));
        }
    }
    class Mr {
        constructor(t) {
            ((this.computed = t),
                (this.version = 0),
                (this.activeLink = void 0),
                (this.subs = void 0),
                (this.map = void 0),
                (this.key = void 0),
                (this.sc = 0),
                (this.__v_skip = !0));
        }
        track(t) {
            if (!De || !Tt || De === this.computed) return;
            let n = this.activeLink;
            if (n === void 0 || n.sub !== De)
                ((n = this.activeLink = new ql(De, this)),
                    De.deps
                        ? ((n.prevDep = De.depsTail),
                          (De.depsTail.nextDep = n),
                          (De.depsTail = n))
                        : (De.deps = De.depsTail = n),
                    go(n));
            else if (
                n.version === -1 &&
                ((n.version = this.version), n.nextDep)
            ) {
                const s = n.nextDep;
                ((s.prevDep = n.prevDep),
                    n.prevDep && (n.prevDep.nextDep = s),
                    (n.prevDep = De.depsTail),
                    (n.nextDep = void 0),
                    (De.depsTail.nextDep = n),
                    (De.depsTail = n),
                    De.deps === n && (De.deps = s));
            }
            return n;
        }
        trigger(t) {
            (this.version++, Xn++, this.notify(t));
        }
        notify(t) {
            Rr();
            try {
                for (let n = this.subs; n; n = n.prevSub)
                    n.sub.notify() && n.sub.dep.notify();
            } finally {
                Ar();
            }
        }
    }
    function go(e) {
        if ((e.dep.sc++, e.sub.flags & 4)) {
            const t = e.dep.computed;
            if (t && !e.dep.subs) {
                t.flags |= 20;
                for (let s = t.deps; s; s = s.nextDep) go(s);
            }
            const n = e.dep.subs;
            (n !== e && ((e.prevSub = n), n && (n.nextSub = e)),
                (e.dep.subs = e));
        }
    }
    const Nr = new WeakMap(),
        cn = Symbol(""),
        Dr = Symbol(""),
        Gn = Symbol("");
    function st(e, t, n) {
        if (Tt && De) {
            let s = Nr.get(e);
            s || Nr.set(e, (s = new Map()));
            let r = s.get(n);
            (r || (s.set(n, (r = new Mr())), (r.map = s), (r.key = n)),
                r.track());
        }
    }
    function Ht(e, t, n, s, r, i) {
        const a = Nr.get(e);
        if (!a) {
            Xn++;
            return;
        }
        const c = (u) => {
            u && u.trigger();
        };
        if ((Rr(), t === "clear")) a.forEach(c);
        else {
            const u = ue(e),
                h = u && Sr(n);
            if (u && n === "length") {
                const d = Number(s);
                a.forEach((v, w) => {
                    (w === "length" || w === Gn || (!Ct(w) && w >= d)) && c(v);
                });
            } else
                switch (
                    ((n !== void 0 || a.has(void 0)) && c(a.get(n)),
                    h && c(a.get(Gn)),
                    t)
                ) {
                    case "add":
                        u
                            ? h && c(a.get("length"))
                            : (c(a.get(cn)), Cn(e) && c(a.get(Dr)));
                        break;
                    case "delete":
                        u || (c(a.get(cn)), Cn(e) && c(a.get(Dr)));
                        break;
                    case "set":
                        Cn(e) && c(a.get(cn));
                        break;
                }
        }
        Ar();
    }
    function Tn(e) {
        const t = ke(e);
        return t === e ? t : (st(t, "iterate", Gn), yt(e) ? t : t.map(Et));
    }
    function Ps(e) {
        return (st((e = ke(e)), "iterate", Gn), e);
    }
    function Nt(e, t) {
        return zt(e) ? En(ln(e) ? Et(t) : t) : Et(t);
    }
    const zl = {
        __proto__: null,
        [Symbol.iterator]() {
            return jr(this, Symbol.iterator, (e) => Nt(this, e));
        },
        concat(...e) {
            return Tn(this).concat(...e.map((t) => (ue(t) ? Tn(t) : t)));
        },
        entries() {
            return jr(this, "entries", (e) => ((e[1] = Nt(this, e[1])), e));
        },
        every(e, t) {
            return qt(this, "every", e, t, void 0, arguments);
        },
        filter(e, t) {
            return qt(
                this,
                "filter",
                e,
                t,
                (n) => n.map((s) => Nt(this, s)),
                arguments,
            );
        },
        find(e, t) {
            return qt(this, "find", e, t, (n) => Nt(this, n), arguments);
        },
        findIndex(e, t) {
            return qt(this, "findIndex", e, t, void 0, arguments);
        },
        findLast(e, t) {
            return qt(this, "findLast", e, t, (n) => Nt(this, n), arguments);
        },
        findLastIndex(e, t) {
            return qt(this, "findLastIndex", e, t, void 0, arguments);
        },
        forEach(e, t) {
            return qt(this, "forEach", e, t, void 0, arguments);
        },
        includes(...e) {
            return Ir(this, "includes", e);
        },
        indexOf(...e) {
            return Ir(this, "indexOf", e);
        },
        join(e) {
            return Tn(this).join(e);
        },
        lastIndexOf(...e) {
            return Ir(this, "lastIndexOf", e);
        },
        map(e, t) {
            return qt(this, "map", e, t, void 0, arguments);
        },
        pop() {
            return Zn(this, "pop");
        },
        push(...e) {
            return Zn(this, "push", e);
        },
        reduce(e, ...t) {
            return bo(this, "reduce", e, t);
        },
        reduceRight(e, ...t) {
            return bo(this, "reduceRight", e, t);
        },
        shift() {
            return Zn(this, "shift");
        },
        some(e, t) {
            return qt(this, "some", e, t, void 0, arguments);
        },
        splice(...e) {
            return Zn(this, "splice", e);
        },
        toReversed() {
            return Tn(this).toReversed();
        },
        toSorted(e) {
            return Tn(this).toSorted(e);
        },
        toSpliced(...e) {
            return Tn(this).toSpliced(...e);
        },
        unshift(...e) {
            return Zn(this, "unshift", e);
        },
        values() {
            return jr(this, "values", (e) => Nt(this, e));
        },
    };
    function jr(e, t, n) {
        const s = Ps(e),
            r = s[t]();
        return (
            s !== e &&
                !yt(e) &&
                ((r._next = r.next),
                (r.next = () => {
                    const i = r._next();
                    return (i.done || (i.value = n(i.value)), i);
                })),
            r
        );
    }
    const Vl = Array.prototype;
    function qt(e, t, n, s, r, i) {
        const a = Ps(e),
            c = a !== e && !yt(e),
            u = a[t];
        if (u !== Vl[t]) {
            const v = u.apply(e, i);
            return c ? Et(v) : v;
        }
        let h = n;
        a !== e &&
            (c
                ? (h = function (v, w) {
                      return n.call(this, Nt(e, v), w, e);
                  })
                : n.length > 2 &&
                  (h = function (v, w) {
                      return n.call(this, v, w, e);
                  }));
        const d = u.call(a, h, s);
        return c && r ? r(d) : d;
    }
    function bo(e, t, n, s) {
        const r = Ps(e),
            i = r !== e && !yt(e);
        let a = n,
            c = !1;
        r !== e &&
            (i
                ? ((c = s.length === 0),
                  (a = function (h, d, v) {
                      return (
                          c && ((c = !1), (h = Nt(e, h))),
                          n.call(this, h, Nt(e, d), v, e)
                      );
                  }))
                : n.length > 3 &&
                  (a = function (h, d, v) {
                      return n.call(this, h, d, v, e);
                  }));
        const u = r[t](a, ...s);
        return c ? Nt(e, u) : u;
    }
    function Ir(e, t, n) {
        const s = ke(e);
        st(s, "iterate", Gn);
        const r = s[t](...n);
        return (r === -1 || r === !1) && Fr(n[0])
            ? ((n[0] = ke(n[0])), s[t](...n))
            : r;
    }
    function Zn(e, t, n = []) {
        (Lt(), Rr());
        const s = ke(e)[t].apply(e, n);
        return (Ar(), Mt(), s);
    }
    const Wl = xr("__proto__,__v_isRef,__isVue"),
        yo = new Set(
            Object.getOwnPropertyNames(Symbol)
                .filter((e) => e !== "arguments" && e !== "caller")
                .map((e) => Symbol[e])
                .filter(Ct),
        );
    function Kl(e) {
        Ct(e) || (e = String(e));
        const t = ke(this);
        return (st(t, "has", e), t.hasOwnProperty(e));
    }
    class _o {
        constructor(t = !1, n = !1) {
            ((this._isReadonly = t), (this._isShallow = n));
        }
        get(t, n, s) {
            if (n === "__v_skip") return t.__v_skip;
            const r = this._isReadonly,
                i = this._isShallow;
            if (n === "__v_isReactive") return !r;
            if (n === "__v_isReadonly") return r;
            if (n === "__v_isShallow") return i;
            if (n === "__v_raw")
                return s === (r ? (i ? To : Co) : i ? So : ko).get(t) ||
                    Object.getPrototypeOf(t) === Object.getPrototypeOf(s)
                    ? t
                    : void 0;
            const a = ue(t);
            if (!r) {
                let u;
                if (a && (u = zl[n])) return u;
                if (n === "hasOwnProperty") return Kl;
            }
            const c = Reflect.get(t, n, Ge(t) ? t : s);
            if ((Ct(n) ? yo.has(n) : Wl(n)) || (r || st(t, "get", n), i))
                return c;
            if (Ge(c)) {
                const u = a && Sr(n) ? c : c.value;
                return r && $e(u) ? Br(u) : u;
            }
            return $e(c) ? (r ? Br(c) : $s(c)) : c;
        }
    }
    class wo extends _o {
        constructor(t = !1) {
            super(!1, t);
        }
        set(t, n, s, r) {
            let i = t[n];
            const a = ue(t) && Sr(n);
            if (!this._isShallow) {
                const h = zt(i);
                if (
                    (!yt(s) && !zt(s) && ((i = ke(i)), (s = ke(s))),
                    !a && Ge(i) && !Ge(s))
                )
                    return (h || (i.value = s), !0);
            }
            const c = a ? Number(n) < t.length : Ee(t, n),
                u = Reflect.set(t, n, s, Ge(t) ? t : r);
            return (
                t === ke(r) &&
                    u &&
                    (c ? At(s, i) && Ht(t, "set", n, s) : Ht(t, "add", n, s)),
                u
            );
        }
        deleteProperty(t, n) {
            const s = Ee(t, n);
            t[n];
            const r = Reflect.deleteProperty(t, n);
            return (r && s && Ht(t, "delete", n, void 0), r);
        }
        has(t, n) {
            const s = Reflect.has(t, n);
            return ((!Ct(n) || !yo.has(n)) && st(t, "has", n), s);
        }
        ownKeys(t) {
            return (
                st(t, "iterate", ue(t) ? "length" : cn),
                Reflect.ownKeys(t)
            );
        }
    }
    class xo extends _o {
        constructor(t = !1) {
            super(!0, t);
        }
        set(t, n) {
            return !0;
        }
        deleteProperty(t, n) {
            return !0;
        }
    }
    const Jl = new wo(),
        Xl = new xo(),
        Gl = new wo(!0),
        Zl = new xo(!0),
        Ur = (e) => e,
        Os = (e) => Reflect.getPrototypeOf(e);
    function Ql(e, t, n) {
        return function (...s) {
            const r = this.__v_raw,
                i = ke(r),
                a = Cn(i),
                c = e === "entries" || (e === Symbol.iterator && a),
                u = e === "keys" && a,
                h = r[e](...s),
                d = n ? Ur : t ? En : Et;
            return (
                !t && st(i, "iterate", u ? Dr : cn),
                nt(Object.create(h), {
                    next() {
                        const { value: v, done: w } = h.next();
                        return w
                            ? { value: v, done: w }
                            : { value: c ? [d(v[0]), d(v[1])] : d(v), done: w };
                    },
                })
            );
        };
    }
    function Rs(e) {
        return function (...t) {
            return e === "delete" ? !1 : e === "clear" ? void 0 : this;
        };
    }
    function Yl(e, t) {
        const n = {
            get(r) {
                const i = this.__v_raw,
                    a = ke(i),
                    c = ke(r);
                e || (At(r, c) && st(a, "get", r), st(a, "get", c));
                const { has: u } = Os(a),
                    h = t ? Ur : e ? En : Et;
                if (u.call(a, r)) return h(i.get(r));
                if (u.call(a, c)) return h(i.get(c));
                i !== a && i.get(r);
            },
            get size() {
                const r = this.__v_raw;
                return (!e && st(ke(r), "iterate", cn), r.size);
            },
            has(r) {
                const i = this.__v_raw,
                    a = ke(i),
                    c = ke(r);
                return (
                    e || (At(r, c) && st(a, "has", r), st(a, "has", c)),
                    r === c ? i.has(r) : i.has(r) || i.has(c)
                );
            },
            forEach(r, i) {
                const a = this,
                    c = a.__v_raw,
                    u = ke(c),
                    h = t ? Ur : e ? En : Et;
                return (
                    !e && st(u, "iterate", cn),
                    c.forEach((d, v) => r.call(i, h(d), h(v), a))
                );
            },
        };
        return (
            nt(
                n,
                e
                    ? {
                          add: Rs("add"),
                          set: Rs("set"),
                          delete: Rs("delete"),
                          clear: Rs("clear"),
                      }
                    : {
                          add(r) {
                              const i = ke(this),
                                  a = Os(i),
                                  c = ke(r),
                                  u = !t && !yt(r) && !zt(r) ? c : r;
                              return (
                                  a.has.call(i, u) ||
                                      (At(r, u) && a.has.call(i, r)) ||
                                      (At(c, u) && a.has.call(i, c)) ||
                                      (i.add(u), Ht(i, "add", u, u)),
                                  this
                              );
                          },
                          set(r, i) {
                              !t && !yt(i) && !zt(i) && (i = ke(i));
                              const a = ke(this),
                                  { has: c, get: u } = Os(a);
                              let h = c.call(a, r);
                              h || ((r = ke(r)), (h = c.call(a, r)));
                              const d = u.call(a, r);
                              return (
                                  a.set(r, i),
                                  h
                                      ? At(i, d) && Ht(a, "set", r, i)
                                      : Ht(a, "add", r, i),
                                  this
                              );
                          },
                          delete(r) {
                              const i = ke(this),
                                  { has: a, get: c } = Os(i);
                              let u = a.call(i, r);
                              (u || ((r = ke(r)), (u = a.call(i, r))),
                                  c && c.call(i, r));
                              const h = i.delete(r);
                              return (u && Ht(i, "delete", r, void 0), h);
                          },
                          clear() {
                              const r = ke(this),
                                  i = r.size !== 0,
                                  a = r.clear();
                              return (i && Ht(r, "clear", void 0, void 0), a);
                          },
                      },
            ),
            ["keys", "values", "entries", Symbol.iterator].forEach((r) => {
                n[r] = Ql(r, e, t);
            }),
            n
        );
    }
    function As(e, t) {
        const n = Yl(e, t);
        return (s, r, i) =>
            r === "__v_isReactive"
                ? !e
                : r === "__v_isReadonly"
                  ? e
                  : r === "__v_raw"
                    ? s
                    : Reflect.get(Ee(n, r) && r in s ? n : s, r, i);
    }
    const eu = { get: As(!1, !1) },
        tu = { get: As(!1, !0) },
        nu = { get: As(!0, !1) },
        su = { get: As(!0, !0) },
        ko = new WeakMap(),
        So = new WeakMap(),
        Co = new WeakMap(),
        To = new WeakMap();
    function ru(e) {
        switch (e) {
            case "Object":
            case "Array":
                return 1;
            case "Map":
            case "Set":
            case "WeakMap":
            case "WeakSet":
                return 2;
            default:
                return 0;
        }
    }
    function $s(e) {
        return zt(e) ? e : Ls(e, !1, Jl, eu, ko);
    }
    function iu(e) {
        return Ls(e, !1, Gl, tu, So);
    }
    function Br(e) {
        return Ls(e, !0, Xl, nu, Co);
    }
    function C_(e) {
        return Ls(e, !0, Zl, su, To);
    }
    function Ls(e, t, n, s, r) {
        if (
            !$e(e) ||
            (e.__v_raw && !(t && e.__v_isReactive)) ||
            e.__v_skip ||
            !Object.isExtensible(e)
        )
            return e;
        const i = r.get(e);
        if (i) return i;
        const a = ru(Al(e));
        if (a === 0) return e;
        const c = new Proxy(e, a === 2 ? s : n);
        return (r.set(e, c), c);
    }
    function ln(e) {
        return zt(e) ? ln(e.__v_raw) : !!(e && e.__v_isReactive);
    }
    function zt(e) {
        return !!(e && e.__v_isReadonly);
    }
    function yt(e) {
        return !!(e && e.__v_isShallow);
    }
    function Fr(e) {
        return e ? !!e.__v_raw : !1;
    }
    function ke(e) {
        const t = e && e.__v_raw;
        return t ? ke(t) : e;
    }
    function ou(e) {
        return (
            !Ee(e, "__v_skip") &&
                Object.isExtensible(e) &&
                no(e, "__v_skip", !0),
            e
        );
    }
    const Et = (e) => ($e(e) ? $s(e) : e),
        En = (e) => ($e(e) ? Br(e) : e);
    function Ge(e) {
        return e ? e.__v_isRef === !0 : !1;
    }
    function G(e) {
        return au(e, !1);
    }
    function au(e, t) {
        return Ge(e) ? e : new cu(e, t);
    }
    class cu {
        constructor(t, n) {
            ((this.dep = new Mr()),
                (this.__v_isRef = !0),
                (this.__v_isShallow = !1),
                (this._rawValue = n ? t : ke(t)),
                (this._value = n ? t : Et(t)),
                (this.__v_isShallow = n));
        }
        get value() {
            return (this.dep.track(), this._value);
        }
        set value(t) {
            const n = this._rawValue,
                s = this.__v_isShallow || yt(t) || zt(t);
            ((t = s ? t : ke(t)),
                At(t, n) &&
                    ((this._rawValue = t),
                    (this._value = s ? t : Et(t)),
                    this.dep.trigger()));
        }
    }
    function ge(e) {
        return Ge(e) ? e.value : e;
    }
    const lu = {
        get: (e, t, n) => (t === "__v_raw" ? e : ge(Reflect.get(e, t, n))),
        set: (e, t, n, s) => {
            const r = e[t];
            return Ge(r) && !Ge(n)
                ? ((r.value = n), !0)
                : Reflect.set(e, t, n, s);
        },
    };
    function Eo(e) {
        return ln(e) ? e : new Proxy(e, lu);
    }
    class uu {
        constructor(t, n, s) {
            ((this.fn = t),
                (this.setter = n),
                (this._value = void 0),
                (this.dep = new Mr(this)),
                (this.__v_isRef = !0),
                (this.deps = void 0),
                (this.depsTail = void 0),
                (this.flags = 16),
                (this.globalVersion = Xn - 1),
                (this.next = void 0),
                (this.effect = this),
                (this.__v_isReadonly = !n),
                (this.isSSR = s));
        }
        notify() {
            if (((this.flags |= 16), !(this.flags & 8) && De !== this))
                return (uo(this, !0), !0);
        }
        get value() {
            const t = this.dep.track();
            return (po(this), t && (t.version = this.dep.version), this._value);
        }
        set value(t) {
            this.setter && this.setter(t);
        }
    }
    function fu(e, t, n = !1) {
        let s, r;
        return (he(e) ? (s = e) : ((s = e.get), (r = e.set)), new uu(s, r, n));
    }
    const Ms = {},
        Ns = new WeakMap();
    let un;
    function du(e, t = !1, n = un) {
        if (n) {
            let s = Ns.get(n);
            (s || Ns.set(n, (s = [])), s.push(e));
        }
    }
    function hu(e, t, n = Me) {
        const {
                immediate: s,
                deep: r,
                once: i,
                scheduler: a,
                augmentJob: c,
                call: u,
            } = n,
            h = (b) =>
                r ? b : yt(b) || r === !1 || r === 0 ? Vt(b, 1) : Vt(b);
        let d,
            v,
            w,
            C,
            O = !1,
            P = !1;
        if (
            (Ge(e)
                ? ((v = () => e.value), (O = yt(e)))
                : ln(e)
                  ? ((v = () => h(e)), (O = !0))
                  : ue(e)
                    ? ((P = !0),
                      (O = e.some((b) => ln(b) || yt(b))),
                      (v = () =>
                          e.map((b) => {
                              if (Ge(b)) return b.value;
                              if (ln(b)) return h(b);
                              if (he(b)) return u ? u(b, 2) : b();
                          })))
                    : he(e)
                      ? t
                          ? (v = u ? () => u(e, 2) : e)
                          : (v = () => {
                                if (w) {
                                    Lt();
                                    try {
                                        w();
                                    } finally {
                                        Mt();
                                    }
                                }
                                const b = un;
                                un = d;
                                try {
                                    return u ? u(e, 3, [C]) : e(C);
                                } finally {
                                    un = b;
                                }
                            })
                      : (v = Rt),
            t && r)
        ) {
            const b = v,
                L = r === !0 ? 1 / 0 : r;
            v = () => Vt(b(), L);
        }
        const A = Fl(),
            T = () => {
                (d.stop(), A && A.active && kr(A.effects, d));
            };
        if (i && t) {
            const b = t;
            t = (...L) => {
                const B = b(...L);
                return (T(), B);
            };
        }
        let m = P ? new Array(e.length).fill(Ms) : Ms;
        const g = (b) => {
            if (!(!(d.flags & 1) || (!d.dirty && !b)))
                if (t) {
                    const L = d.run();
                    if (
                        b ||
                        r ||
                        O ||
                        (P ? L.some((B, J) => At(B, m[J])) : At(L, m))
                    ) {
                        w && w();
                        const B = un;
                        un = d;
                        try {
                            const J = [
                                L,
                                m === Ms ? void 0 : P && m[0] === Ms ? [] : m,
                                C,
                            ];
                            ((m = L), u ? u(t, 3, J) : t(...J));
                        } finally {
                            un = B;
                        }
                    }
                } else d.run();
        };
        return (
            c && c(g),
            (d = new co(v)),
            (d.scheduler = a ? () => a(g, !1) : g),
            (C = (b) => du(b, !1, d)),
            (w = d.onStop =
                () => {
                    const b = Ns.get(d);
                    if (b) {
                        if (u) u(b, 4);
                        else for (const L of b) L();
                        Ns.delete(d);
                    }
                }),
            t
                ? s
                    ? g(!0)
                    : (m = d.run())
                : a
                  ? a(g.bind(null, !0), !0)
                  : d.run(),
            (T.pause = d.pause.bind(d)),
            (T.resume = d.resume.bind(d)),
            (T.stop = T),
            T
        );
    }
    function Vt(e, t = 1 / 0, n) {
        if (
            t <= 0 ||
            !$e(e) ||
            e.__v_skip ||
            ((n = n || new Map()), (n.get(e) || 0) >= t)
        )
            return e;
        if ((n.set(e, t), t--, Ge(e))) Vt(e.value, t, n);
        else if (ue(e)) for (let s = 0; s < e.length; s++) Vt(e[s], t, n);
        else if (Zi(e) || Cn(e))
            e.forEach((s) => {
                Vt(s, t, n);
            });
        else if (to(e)) {
            for (const s in e) Vt(e[s], t, n);
            for (const s of Object.getOwnPropertySymbols(e))
                Object.prototype.propertyIsEnumerable.call(e, s) &&
                    Vt(e[s], t, n);
        }
        return e;
    }
    /**
     * @vue/runtime-core v3.5.40
     * (c) 2018-present Yuxi (Evan) You and Vue contributors
     * @license MIT
     **/ const Qn = [];
    let Hr = !1;
    function T_(e, ...t) {
        if (Hr) return;
        ((Hr = !0), Lt());
        const n = Qn.length ? Qn[Qn.length - 1].component : null,
            s = n && n.appContext.config.warnHandler,
            r = pu();
        if (s)
            Pn(s, n, 11, [
                e +
                    t
                        .map((i) => {
                            var a, c;
                            return (c =
                                (a = i.toString) == null
                                    ? void 0
                                    : a.call(i)) != null
                                ? c
                                : JSON.stringify(i);
                        })
                        .join(""),
                n && n.proxy,
                r.map(({ vnode: i }) => `at <${Ta(n, i.type)}>`).join(`
`),
                r,
            ]);
        else {
            const i = [`[Vue warn]: ${e}`, ...t];
            (r.length &&
                i.push(
                    `
`,
                    ...vu(r),
                ),
                console.warn(...i));
        }
        (Mt(), (Hr = !1));
    }
    function pu() {
        let e = Qn[Qn.length - 1];
        if (!e) return [];
        const t = [];
        for (; e; ) {
            const n = t[0];
            n && n.vnode === e
                ? n.recurseCount++
                : t.push({ vnode: e, recurseCount: 0 });
            const s = e.component && e.component.parent;
            e = s && s.vnode;
        }
        return t;
    }
    function vu(e) {
        const t = [];
        return (
            e.forEach((n, s) => {
                t.push(
                    ...(s === 0
                        ? []
                        : [
                              `
`,
                          ]),
                    ...mu(n),
                );
            }),
            t
        );
    }
    function mu({ vnode: e, recurseCount: t }) {
        const n = t > 0 ? `... (${t} recursive calls)` : "",
            s = e.component ? e.component.parent == null : !1,
            r = ` at <${Ta(e.component, e.type, s)}`,
            i = ">" + n;
        return e.props ? [r, ...gu(e.props), i] : [r + i];
    }
    function gu(e) {
        const t = [],
            n = Object.keys(e);
        return (
            n.slice(0, 3).forEach((s) => {
                t.push(...Po(s, e[s]));
            }),
            n.length > 3 && t.push(" ..."),
            t
        );
    }
    function Po(e, t, n) {
        return Ie(t)
            ? ((t = JSON.stringify(t)), n ? t : [`${e}=${t}`])
            : typeof t == "number" || typeof t == "boolean" || t == null
              ? n
                  ? t
                  : [`${e}=${t}`]
              : Ge(t)
                ? ((t = Po(e, ke(t.value), !0)), n ? t : [`${e}=Ref<`, t, ">"])
                : he(t)
                  ? [`${e}=fn${t.name ? `<${t.name}>` : ""}`]
                  : ((t = ke(t)), n ? t : [`${e}=`, t]);
    }
    function Pn(e, t, n, s) {
        try {
            return s ? e(...s) : e();
        } catch (r) {
            Ds(r, t, n);
        }
    }
    function Pt(e, t, n, s) {
        if (he(e)) {
            const r = Pn(e, t, n, s);
            return (
                r &&
                    Yi(r) &&
                    r.catch((i) => {
                        Ds(i, t, n);
                    }),
                r
            );
        }
        if (ue(e)) {
            const r = [];
            for (let i = 0; i < e.length; i++) r.push(Pt(e[i], t, n, s));
            return r;
        }
    }
    function Ds(e, t, n, s = !0) {
        const r = t ? t.vnode : null,
            { errorHandler: i, throwUnhandledErrorInProduction: a } =
                (t && t.appContext.config) || Me;
        if (t) {
            let c = t.parent;
            const u = t.proxy,
                h = `https://vuejs.org/error-reference/#runtime-${n}`;
            for (; c; ) {
                const d = c.ec;
                if (d) {
                    for (let v = 0; v < d.length; v++)
                        if (d[v](e, u, h) === !1) return;
                }
                c = c.parent;
            }
            if (i) {
                (Lt(), Pn(i, null, 10, [e, u, h]), Mt());
                return;
            }
        }
        bu(e, n, r, s, a);
    }
    function bu(e, t, n, s = !0, r = !1) {
        if (r) throw e;
        console.error(e);
    }
    const ct = [];
    let Dt = -1;
    const On = [];
    let on = null,
        Rn = 0;
    const Oo = Promise.resolve();
    let js = null;
    function Is(e) {
        const t = js || Oo;
        return e ? t.then(this ? e.bind(this) : e) : t;
    }
    function yu(e) {
        let t = Dt + 1,
            n = ct.length;
        for (; t < n; ) {
            const s = (t + n) >>> 1,
                r = ct[s],
                i = Yn(r);
            i < e || (i === e && r.flags & 2) ? (t = s + 1) : (n = s);
        }
        return t;
    }
    function qr(e) {
        if (!(e.flags & 1)) {
            const t = Yn(e),
                n = ct[ct.length - 1];
            (!n || (!(e.flags & 2) && t >= Yn(n))
                ? ct.push(e)
                : ct.splice(yu(t), 0, e),
                (e.flags |= 1),
                Ro());
        }
    }
    function Ro() {
        js || (js = Oo.then(Lo));
    }
    function _u(e) {
        (ue(e)
            ? On.push(...e)
            : on && e.id === -1
              ? on.splice(Rn + 1, 0, e)
              : e.flags & 1 || (On.push(e), (e.flags |= 1)),
            Ro());
    }
    function Ao(e, t, n = Dt + 1) {
        for (; n < ct.length; n++) {
            const s = ct[n];
            if (s && s.flags & 2) {
                if (e && s.id !== e.uid) continue;
                (ct.splice(n, 1),
                    n--,
                    s.flags & 4 && (s.flags &= -2),
                    s(),
                    s.flags & 4 || (s.flags &= -2));
            }
        }
    }
    function $o(e) {
        if (On.length) {
            const t = [...new Set(On)].sort((n, s) => Yn(n) - Yn(s));
            if (((On.length = 0), on)) {
                on.push(...t);
                return;
            }
            for (on = t, Rn = 0; Rn < on.length; Rn++) {
                const n = on[Rn];
                (n.flags & 4 && (n.flags &= -2),
                    n.flags & 8 || n(),
                    (n.flags &= -2));
            }
            ((on = null), (Rn = 0));
        }
    }
    const Yn = (e) => (e.id == null ? (e.flags & 2 ? -1 : 1 / 0) : e.id);
    function Lo(e) {
        try {
            for (Dt = 0; Dt < ct.length; Dt++) {
                const t = ct[Dt];
                t &&
                    !(t.flags & 8) &&
                    (t.flags & 4 && (t.flags &= -2),
                    Pn(t, t.i, t.i ? 15 : 14),
                    t.flags & 4 || (t.flags &= -2));
            }
        } finally {
            for (; Dt < ct.length; Dt++) {
                const t = ct[Dt];
                t && (t.flags &= -2);
            }
            ((Dt = -1),
                (ct.length = 0),
                $o(),
                (js = null),
                (ct.length || On.length) && Lo());
        }
    }
    let Ze = null,
        Mo = null;
    function Us(e) {
        const t = Ze;
        return ((Ze = e), (Mo = (e && e.type.__scopeId) || null), t);
    }
    function Wt(e, t = Ze, n) {
        if (!t || e._n) return e;
        const s = (...r) => {
            s._d && ba(-1);
            const i = Us(t),
                a = Xt.length;
            let c;
            try {
                c = e(...r);
            } finally {
                for (let u = Xt.length; u > a; u--) ni();
                (Us(i), s._d && ba(1));
            }
            return c;
        };
        return ((s._n = !0), (s._c = !0), (s._d = !0), s);
    }
    function An(e, t) {
        if (Ze === null) return e;
        const n = Xs(Ze),
            s = e.dirs || (e.dirs = []);
        for (let r = 0; r < t.length; r++) {
            let [i, a, c, u = Me] = t[r];
            i &&
                (he(i) && (i = { mounted: i, updated: i }),
                i.deep && Vt(a),
                s.push({
                    dir: i,
                    instance: n,
                    value: a,
                    oldValue: void 0,
                    arg: c,
                    modifiers: u,
                }));
        }
        return e;
    }
    function fn(e, t, n, s) {
        const r = e.dirs,
            i = t && t.dirs;
        for (let a = 0; a < r.length; a++) {
            const c = r[a];
            i && (c.oldValue = i[a].value);
            let u = c.dir[s];
            u && (Lt(), Pt(u, n, 8, [e.el, c, e, t]), Mt());
        }
    }
    function wu(e, t) {
        if (rt) {
            let n = rt.provides;
            const s = rt.parent && rt.parent.provides;
            (s === n && (n = rt.provides = Object.create(s)), (n[e] = t));
        }
    }
    function Bs(e, t, n = !1) {
        const s = bf();
        if (s || Ln) {
            let r = Ln
                ? Ln._context.provides
                : s
                  ? s.parent == null || s.ce
                      ? s.vnode.appContext && s.vnode.appContext.provides
                      : s.parent.provides
                  : void 0;
            if (r && e in r) return r[e];
            if (arguments.length > 1)
                return n && he(t) ? t.call(s && s.proxy) : t;
        }
    }
    const xu = Symbol.for("v-scx"),
        ku = () => Bs(xu);
    function Qe(e, t, n) {
        return No(e, t, n);
    }
    function No(e, t, n = Me) {
        const { immediate: s, deep: r, flush: i, once: a } = n,
            c = nt({}, n),
            u = (t && s) || (!t && i !== "post");
        let h;
        if (as) {
            if (i === "sync") {
                const C = ku();
                h = C.__watcherHandles || (C.__watcherHandles = []);
            } else if (!u) {
                const C = () => {};
                return ((C.stop = Rt), (C.resume = Rt), (C.pause = Rt), C);
            }
        }
        const d = rt;
        c.call = (C, O, P) => Pt(C, d, O, P);
        let v = !1;
        (i === "post"
            ? (c.scheduler = (C) => {
                  ht(C, d && d.suspense);
              })
            : i !== "sync" &&
              ((v = !0),
              (c.scheduler = (C, O) => {
                  O ? C() : qr(C);
              })),
            (c.augmentJob = (C) => {
                (t && (C.flags |= 4),
                    v && ((C.flags |= 2), d && ((C.id = d.uid), (C.i = d))));
            }));
        const w = hu(e, t, c);
        return (as && (h ? h.push(w) : u && w()), w);
    }
    function Su(e, t, n) {
        const s = this.proxy,
            r = Ie(e)
                ? e.includes(".")
                    ? Do(s, e)
                    : () => s[e]
                : e.bind(s, s);
        let i;
        he(t) ? (i = t) : ((i = t.handler), (n = t));
        const a = os(this),
            c = No(r, i.bind(s), n);
        return (a(), c);
    }
    function Do(e, t) {
        const n = t.split(".");
        return () => {
            let s = e;
            for (let r = 0; r < n.length && s; r++) s = s[n[r]];
            return s;
        };
    }
    const Cu = Symbol("_vte"),
        Tu = (e) => e.__isTeleport,
        zr = Symbol("_leaveCb");
    function Vr(e, t) {
        e.shapeFlag & 6 && e.component
            ? ((e.transition = t), Vr(e.component.subTree, t))
            : e.shapeFlag & 128
              ? ((e.ssContent.transition = t.clone(e.ssContent)),
                (e.ssFallback.transition = t.clone(e.ssFallback)))
              : (e.transition = t);
    }
    function jo(e) {
        e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
    }
    function Io(e, t) {
        let n;
        return !!(
            (n = Object.getOwnPropertyDescriptor(e, t)) && !n.configurable
        );
    }
    const Fs = new WeakMap();
    function es(e, t, n, s, r = !1) {
        if (ue(e)) {
            e.forEach((P, A) => es(P, t && (ue(t) ? t[A] : t), n, s, r));
            return;
        }
        if ($n(s) && !r) {
            s.shapeFlag & 512 &&
                s.type.__asyncResolved &&
                s.component.subTree.component &&
                es(e, t, n, s.component.subTree);
            return;
        }
        const i = s.shapeFlag & 4 ? Xs(s.component) : s.el,
            a = r ? null : i,
            { i: c, r: u } = e,
            h = t && t.r,
            d = c.refs === Me ? (c.refs = {}) : c.refs,
            v = c.setupState,
            w = ke(v),
            C = v === Me ? Gi : (P) => (Io(d, P) ? !1 : Ee(w, P)),
            O = (P, A) => !(A && Io(d, A));
        if (h != null && h !== u) {
            if ((Uo(t), Ie(h))) ((d[h] = null), C(h) && (v[h] = null));
            else if (Ge(h)) {
                const P = t;
                (O(h, P.k) && (h.value = null), P.k && (d[P.k] = null));
            }
        }
        if (he(u)) Pn(u, c, 12, [a, d]);
        else {
            const P = Ie(u),
                A = Ge(u);
            if (P || A) {
                const T = () => {
                    if (e.f) {
                        const m = P
                            ? C(u)
                                ? v[u]
                                : d[u]
                            : O() || !e.k
                              ? u.value
                              : d[e.k];
                        if (r) ue(m) && kr(m, i);
                        else if (ue(m)) m.includes(i) || m.push(i);
                        else if (P) ((d[u] = [i]), C(u) && (v[u] = d[u]));
                        else {
                            const g = [i];
                            (O(u, e.k) && (u.value = g), e.k && (d[e.k] = g));
                        }
                    } else
                        P
                            ? ((d[u] = a), C(u) && (v[u] = a))
                            : A &&
                              (O(u, e.k) && (u.value = a), e.k && (d[e.k] = a));
                };
                if (a) {
                    const m = () => {
                        (T(), Fs.delete(e));
                    };
                    ((m.id = -1), Fs.set(e, m), ht(m, n));
                } else (Uo(e), T());
            }
        }
    }
    function Uo(e) {
        const t = Fs.get(e);
        t && ((t.flags |= 8), Fs.delete(e));
    }
    (Es().requestIdleCallback, Es().cancelIdleCallback);
    const $n = (e) => !!e.type.__asyncLoader,
        Bo = (e) => e.type.__isKeepAlive;
    function Eu(e, t) {
        Fo(e, "a", t);
    }
    function Pu(e, t) {
        Fo(e, "da", t);
    }
    function Fo(e, t, n = rt) {
        const s =
            e.__wdc ||
            (e.__wdc = () => {
                let r = n;
                for (; r; ) {
                    if (r.isDeactivated) return;
                    r = r.parent;
                }
                return e();
            });
        if ((Hs(t, s, n), n)) {
            let r = n.parent;
            for (; r && r.parent; )
                (Bo(r.parent.vnode) && Ou(s, t, n, r), (r = r.parent));
        }
    }
    function Ou(e, t, n, s) {
        const r = Hs(t, e, s, !0);
        ts(() => {
            kr(s[t], r);
        }, n);
    }
    function Hs(e, t, n = rt, s = !1) {
        if (n) {
            const r = n[e] || (n[e] = []),
                i =
                    t.__weh ||
                    (t.__weh = (...a) => {
                        Lt();
                        const c = os(n),
                            u = Pt(t, n, e, a);
                        return (c(), Mt(), u);
                    });
            return (s ? r.unshift(i) : r.push(i), i);
        }
    }
    const Kt =
            (e) =>
            (t, n = rt) => {
                (!as || e === "sp") && Hs(e, (...s) => t(...s), n);
            },
        Ru = Kt("bm"),
        jt = Kt("m"),
        Au = Kt("bu"),
        Ho = Kt("u"),
        Wr = Kt("bum"),
        ts = Kt("um"),
        $u = Kt("sp"),
        Lu = Kt("rtg"),
        Mu = Kt("rtc");
    function Nu(e, t = rt) {
        Hs("ec", e, t);
    }
    const Du = "components",
        qo = Symbol.for("v-ndc");
    function ju(e) {
        return Ie(e) ? Iu(Du, e, !1) || e : e || qo;
    }
    function Iu(e, t, n = !0, s = !1) {
        const r = Ze || rt;
        if (r) {
            const i = r.type;
            {
                const c = Ca(i, !1);
                if (c && (c === t || c === at(t) || c === Cs(at(t)))) return i;
            }
            const a = zo(r[e] || i[e], t) || zo(r.appContext[e], t);
            return !a && s ? i : a;
        }
    }
    function zo(e, t) {
        return e && (e[t] || e[at(t)] || e[Cs(at(t))]);
    }
    function Ue(e, t, n, s) {
        let r;
        const i = n,
            a = ue(e);
        if (a || Ie(e)) {
            const c = a && ln(e);
            let u = !1,
                h = !1;
            (c && ((u = !yt(e)), (h = zt(e)), (e = Ps(e))),
                (r = new Array(e.length)));
            for (let d = 0, v = e.length; d < v; d++)
                r[d] = t(
                    u ? (h ? En(Et(e[d])) : Et(e[d])) : e[d],
                    d,
                    void 0,
                    i,
                );
        } else if (typeof e == "number") {
            r = new Array(e);
            for (let c = 0; c < e; c++) r[c] = t(c + 1, c, void 0, i);
        } else if ($e(e))
            if (e[Symbol.iterator])
                r = Array.from(e, (c, u) => t(c, u, void 0, i));
            else {
                const c = Object.keys(e);
                r = new Array(c.length);
                for (let u = 0, h = c.length; u < h; u++) {
                    const d = c[u];
                    r[u] = t(e[d], d, u, i);
                }
            }
        else r = [];
        return r;
    }
    function Vo(e, t, n = {}, s, r, i) {
        if (Ze.ce || (Ze.parent && $n(Ze.parent) && Ze.parent.ce)) {
            const h = n,
                d = Object.keys(h).length > 0;
            return (
                t !== "default" && (h.name = t),
                E(),
                we(be, null, [xe("slot", h, s)], d ? -2 : 64)
            );
        }
        let a = e[t];
        a && a._c && (a._d = !1);
        const c = Xt.length;
        E();
        let u;
        try {
            const h = a && Wo(a(n)),
                d = n.key || i || (h && h.key);
            u = we(
                be,
                { key: (d && !Ct(d) ? d : `_${t}`) + (!h && s ? "_fb" : "") },
                h || (s ? s() : []),
                h && e._ === 1 ? 64 : -2,
            );
        } catch (h) {
            for (let d = Xt.length; d > c; d--) ni();
            throw h;
        } finally {
            a && a._c && (a._d = !0);
        }
        return (u.scopeId && (u.slotScopeIds = [u.scopeId + "-s"]), u);
    }
    function Wo(e) {
        return e.some((t) =>
            si(t) ? !(t.type === Jt || (t.type === be && !Wo(t.children))) : !0,
        )
            ? e
            : null;
    }
    const Kr = (e) => (e ? (xa(e) ? Xs(e) : Kr(e.parent)) : null),
        ns = nt(Object.create(null), {
            $: (e) => e,
            $el: (e) => e.vnode.el,
            $data: (e) => e.data,
            $props: (e) => e.props,
            $attrs: (e) => e.attrs,
            $slots: (e) => e.slots,
            $refs: (e) => e.refs,
            $parent: (e) => Kr(e.parent),
            $root: (e) => Kr(e.root),
            $host: (e) => e.ce,
            $emit: (e) => e.emit,
            $options: (e) => Go(e),
            $forceUpdate: (e) =>
                e.f ||
                (e.f = () => {
                    qr(e.update);
                }),
            $nextTick: (e) => e.n || (e.n = Is.bind(e.proxy)),
            $watch: (e) => Su.bind(e),
        }),
        Jr = (e, t) => e !== Me && !e.__isScriptSetup && Ee(e, t),
        Uu = {
            get({ _: e }, t) {
                if (t === "__v_skip") return !0;
                const {
                    ctx: n,
                    setupState: s,
                    data: r,
                    props: i,
                    accessCache: a,
                    type: c,
                    appContext: u,
                } = e;
                if (t[0] !== "$") {
                    const w = a[t];
                    if (w !== void 0)
                        switch (w) {
                            case 1:
                                return s[t];
                            case 2:
                                return r[t];
                            case 4:
                                return n[t];
                            case 3:
                                return i[t];
                        }
                    else {
                        if (Jr(s, t)) return ((a[t] = 1), s[t]);
                        if (r !== Me && Ee(r, t)) return ((a[t] = 2), r[t]);
                        if (Ee(i, t)) return ((a[t] = 3), i[t]);
                        if (n !== Me && Ee(n, t)) return ((a[t] = 4), n[t]);
                        Xr && (a[t] = 0);
                    }
                }
                const h = ns[t];
                let d, v;
                if (h) return (t === "$attrs" && st(e.attrs, "get", ""), h(e));
                if ((d = c.__cssModules) && (d = d[t])) return d;
                if (n !== Me && Ee(n, t)) return ((a[t] = 4), n[t]);
                if (((v = u.config.globalProperties), Ee(v, t))) return v[t];
            },
            set({ _: e }, t, n) {
                const { data: s, setupState: r, ctx: i } = e;
                return Jr(r, t)
                    ? ((r[t] = n), !0)
                    : s !== Me && Ee(s, t)
                      ? ((s[t] = n), !0)
                      : Ee(e.props, t) || (t[0] === "$" && t.slice(1) in e)
                        ? !1
                        : ((i[t] = n), !0);
            },
            has(
                {
                    _: {
                        data: e,
                        setupState: t,
                        accessCache: n,
                        ctx: s,
                        appContext: r,
                        props: i,
                        type: a,
                    },
                },
                c,
            ) {
                let u;
                return !!(
                    n[c] ||
                    (e !== Me && c[0] !== "$" && Ee(e, c)) ||
                    Jr(t, c) ||
                    Ee(i, c) ||
                    Ee(s, c) ||
                    Ee(ns, c) ||
                    Ee(r.config.globalProperties, c) ||
                    ((u = a.__cssModules) && u[c])
                );
            },
            defineProperty(e, t, n) {
                return (
                    n.get != null
                        ? (e._.accessCache[t] = 0)
                        : Ee(n, "value") && this.set(e, t, n.value, null),
                    Reflect.defineProperty(e, t, n)
                );
            },
        };
    function Ko(e) {
        return ue(e) ? e.reduce((t, n) => ((t[n] = null), t), {}) : e;
    }
    let Xr = !0;
    function Bu(e) {
        const t = Go(e),
            n = e.proxy,
            s = e.ctx;
        ((Xr = !1), t.beforeCreate && Jo(t.beforeCreate, e, "bc"));
        const {
            data: r,
            computed: i,
            methods: a,
            watch: c,
            provide: u,
            inject: h,
            created: d,
            beforeMount: v,
            mounted: w,
            beforeUpdate: C,
            updated: O,
            activated: P,
            deactivated: A,
            beforeDestroy: T,
            beforeUnmount: m,
            destroyed: g,
            unmounted: b,
            render: L,
            renderTracked: B,
            renderTriggered: J,
            errorCaptured: oe,
            serverPrefetch: ie,
            expose: z,
            inheritAttrs: Z,
            components: Q,
            directives: K,
            filters: ne,
        } = t;
        if ((h && Fu(h, s, null), a))
            for (const _e in a) {
                const Se = a[_e];
                he(Se) && (s[_e] = Se.bind(n));
            }
        if (r) {
            const _e = r.call(n, n);
            $e(_e) && (e.data = $s(_e));
        }
        if (((Xr = !0), i))
            for (const _e in i) {
                const Se = i[_e],
                    se = he(Se)
                        ? Se.bind(n, n)
                        : he(Se.get)
                          ? Se.get.bind(n, n)
                          : Rt,
                    ae = !he(Se) && he(Se.set) ? Se.set.bind(n) : Rt,
                    fe = ve({ get: se, set: ae });
                Object.defineProperty(s, _e, {
                    enumerable: !0,
                    configurable: !0,
                    get: () => fe.value,
                    set: (Ne) => (fe.value = Ne),
                });
            }
        if (c) for (const _e in c) Xo(c[_e], s, n, _e);
        if (u) {
            const _e = he(u) ? u.call(n) : u;
            Reflect.ownKeys(_e).forEach((Se) => {
                wu(Se, _e[Se]);
            });
        }
        d && Jo(d, e, "c");
        function Oe(_e, Se) {
            ue(Se) ? Se.forEach((se) => _e(se.bind(n))) : Se && _e(Se.bind(n));
        }
        if (
            (Oe(Ru, v),
            Oe(jt, w),
            Oe(Au, C),
            Oe(Ho, O),
            Oe(Eu, P),
            Oe(Pu, A),
            Oe(Nu, oe),
            Oe(Mu, B),
            Oe(Lu, J),
            Oe(Wr, m),
            Oe(ts, b),
            Oe($u, ie),
            ue(z))
        )
            if (z.length) {
                const _e = e.exposed || (e.exposed = {});
                z.forEach((Se) => {
                    Object.defineProperty(_e, Se, {
                        get: () => n[Se],
                        set: (se) => (n[Se] = se),
                        enumerable: !0,
                    });
                });
            } else e.exposed || (e.exposed = {});
        (L && e.render === Rt && (e.render = L),
            Z != null && (e.inheritAttrs = Z),
            Q && (e.components = Q),
            K && (e.directives = K),
            ie && jo(e));
    }
    function Fu(e, t, n = Rt) {
        ue(e) && (e = Gr(e));
        for (const s in e) {
            const r = e[s];
            let i;
            ($e(r)
                ? "default" in r
                    ? (i = Bs(r.from || s, r.default, !0))
                    : (i = Bs(r.from || s))
                : (i = Bs(r)),
                Ge(i)
                    ? Object.defineProperty(t, s, {
                          enumerable: !0,
                          configurable: !0,
                          get: () => i.value,
                          set: (a) => (i.value = a),
                      })
                    : (t[s] = i));
        }
    }
    function Jo(e, t, n) {
        Pt(ue(e) ? e.map((s) => s.bind(t.proxy)) : e.bind(t.proxy), t, n);
    }
    function Xo(e, t, n, s) {
        let r = s.includes(".") ? Do(n, s) : () => n[s];
        if (Ie(e)) {
            const i = t[e];
            he(i) && Qe(r, i);
        } else if (he(e)) Qe(r, e.bind(n));
        else if ($e(e))
            if (ue(e)) e.forEach((i) => Xo(i, t, n, s));
            else {
                const i = he(e.handler) ? e.handler.bind(n) : t[e.handler];
                he(i) && Qe(r, i, e);
            }
    }
    function Go(e) {
        const t = e.type,
            { mixins: n, extends: s } = t,
            {
                mixins: r,
                optionsCache: i,
                config: { optionMergeStrategies: a },
            } = e.appContext,
            c = i.get(t);
        let u;
        return (
            c
                ? (u = c)
                : !r.length && !n && !s
                  ? (u = t)
                  : ((u = {}),
                    r.length && r.forEach((h) => qs(u, h, a, !0)),
                    qs(u, t, a)),
            $e(t) && i.set(t, u),
            u
        );
    }
    function qs(e, t, n, s = !1) {
        const { mixins: r, extends: i } = t;
        (i && qs(e, i, n, !0), r && r.forEach((a) => qs(e, a, n, !0)));
        for (const a in t)
            if (!(s && a === "expose")) {
                const c = Hu[a] || (n && n[a]);
                e[a] = c ? c(e[a], t[a]) : t[a];
            }
        return e;
    }
    const Hu = {
        data: Zo,
        props: Qo,
        emits: Qo,
        methods: ss,
        computed: ss,
        beforeCreate: lt,
        created: lt,
        beforeMount: lt,
        mounted: lt,
        beforeUpdate: lt,
        updated: lt,
        beforeDestroy: lt,
        beforeUnmount: lt,
        destroyed: lt,
        unmounted: lt,
        activated: lt,
        deactivated: lt,
        errorCaptured: lt,
        serverPrefetch: lt,
        components: ss,
        directives: ss,
        watch: zu,
        provide: Zo,
        inject: qu,
    };
    function Zo(e, t) {
        return t
            ? e
                ? function () {
                      return nt(
                          he(e) ? e.call(this, this) : e,
                          he(t) ? t.call(this, this) : t,
                      );
                  }
                : t
            : e;
    }
    function qu(e, t) {
        return ss(Gr(e), Gr(t));
    }
    function Gr(e) {
        if (ue(e)) {
            const t = {};
            for (let n = 0; n < e.length; n++) t[e[n]] = e[n];
            return t;
        }
        return e;
    }
    function lt(e, t) {
        return e ? [...new Set([].concat(e, t))] : t;
    }
    function ss(e, t) {
        return e ? nt(Object.create(null), e, t) : t;
    }
    function Qo(e, t) {
        return e
            ? ue(e) && ue(t)
                ? [...new Set([...e, ...t])]
                : nt(Object.create(null), Ko(e), Ko(t ?? {}))
            : t;
    }
    function zu(e, t) {
        if (!e) return t;
        if (!t) return e;
        const n = nt(Object.create(null), e);
        for (const s in t) n[s] = lt(e[s], t[s]);
        return n;
    }
    function Yo() {
        return {
            app: null,
            config: {
                isNativeTag: Gi,
                performance: !1,
                globalProperties: {},
                optionMergeStrategies: {},
                errorHandler: void 0,
                warnHandler: void 0,
                compilerOptions: {},
            },
            mixins: [],
            components: {},
            directives: {},
            provides: Object.create(null),
            optionsCache: new WeakMap(),
            propsCache: new WeakMap(),
            emitsCache: new WeakMap(),
        };
    }
    let Vu = 0;
    function Wu(e, t) {
        return function (s, r = null) {
            (he(s) || (s = nt({}, s)), r != null && !$e(r) && (r = null));
            const i = Yo(),
                a = new WeakSet(),
                c = [];
            let u = !1;
            const h = (i.app = {
                _uid: Vu++,
                _component: s,
                _props: r,
                _container: null,
                _context: i,
                _instance: null,
                version: Tf,
                get config() {
                    return i.config;
                },
                set config(d) {},
                use(d, ...v) {
                    return (
                        a.has(d) ||
                            (d && he(d.install)
                                ? (a.add(d), d.install(h, ...v))
                                : he(d) && (a.add(d), d(h, ...v))),
                        h
                    );
                },
                mixin(d) {
                    return (i.mixins.includes(d) || i.mixins.push(d), h);
                },
                component(d, v) {
                    return v ? ((i.components[d] = v), h) : i.components[d];
                },
                directive(d, v) {
                    return v ? ((i.directives[d] = v), h) : i.directives[d];
                },
                mount(d, v, w) {
                    if (!u) {
                        const C = h._ceVNode || xe(s, r);
                        return (
                            (C.appContext = i),
                            w === !0 ? (w = "svg") : w === !1 && (w = void 0),
                            e(C, d, w),
                            (u = !0),
                            (h._container = d),
                            (d.__vue_app__ = h),
                            Xs(C.component)
                        );
                    }
                },
                onUnmount(d) {
                    c.push(d);
                },
                unmount() {
                    u &&
                        (Pt(c, h._instance, 16),
                        e(null, h._container),
                        delete h._container.__vue_app__);
                },
                provide(d, v) {
                    return ((i.provides[d] = v), h);
                },
                runWithContext(d) {
                    const v = Ln;
                    Ln = h;
                    try {
                        return d();
                    } finally {
                        Ln = v;
                    }
                },
            });
            return h;
        };
    }
    let Ln = null;
    const Ku = (e, t) =>
        t === "modelValue" || t === "model-value"
            ? e.modelModifiers
            : e[`${t}Modifiers`] ||
              e[`${at(t)}Modifiers`] ||
              e[`${rn(t)}Modifiers`];
    function Ju(e, t, ...n) {
        if (e.isUnmounted) return;
        const s = e.vnode.props || Me;
        let r = n;
        const i = t.startsWith("update:"),
            a = i && Ku(s, t.slice(7));
        a &&
            (a.trim && (r = n.map((d) => (Ie(d) ? d.trim() : d))),
            a.number && (r = n.map(Tr)));
        let c,
            u = s[(c = Cr(t))] || s[(c = Cr(at(t)))];
        (!u && i && (u = s[(c = Cr(rn(t)))]), u && Pt(u, e, 6, r));
        const h = s[c + "Once"];
        if (h) {
            if (!e.emitted) e.emitted = {};
            else if (e.emitted[c]) return;
            ((e.emitted[c] = !0), Pt(h, e, 6, r));
        }
    }
    const Xu = new WeakMap();
    function ea(e, t, n = !1) {
        const s = n ? Xu : t.emitsCache,
            r = s.get(e);
        if (r !== void 0) return r;
        const i = e.emits;
        let a = {},
            c = !1;
        if (!he(e)) {
            const u = (h) => {
                const d = ea(h, t, !0);
                d && ((c = !0), nt(a, d));
            };
            (!n && t.mixins.length && t.mixins.forEach(u),
                e.extends && u(e.extends),
                e.mixins && e.mixins.forEach(u));
        }
        return !i && !c
            ? ($e(e) && s.set(e, null), null)
            : (ue(i) ? i.forEach((u) => (a[u] = null)) : nt(a, i),
              $e(e) && s.set(e, a),
              a);
    }
    function zs(e, t) {
        return !e || !xs(t)
            ? !1
            : ((t = t.slice(2)),
              (t = t === "Once" ? t : t.replace(/Once$/, "")),
              Ee(e, t[0].toLowerCase() + t.slice(1)) ||
                  Ee(e, rn(t)) ||
                  Ee(e, t));
    }
    function E_() {}
    function ta(e) {
        const {
                type: t,
                vnode: n,
                proxy: s,
                withProxy: r,
                propsOptions: [i],
                slots: a,
                attrs: c,
                emit: u,
                render: h,
                renderCache: d,
                props: v,
                data: w,
                setupState: C,
                ctx: O,
                inheritAttrs: P,
            } = e,
            A = Us(e);
        let T, m;
        try {
            if (n.shapeFlag & 4) {
                const b = r || s,
                    L = b;
                ((T = It(h.call(L, b, d, v, C, w, O))), (m = c));
            } else {
                const b = t;
                ((T = It(
                    b.length > 1
                        ? b(v, { attrs: c, slots: a, emit: u })
                        : b(v, null),
                )),
                    (m = t.props ? c : Gu(c)));
            }
        } catch (b) {
            ((Xt.length = 0), Ds(b, e, 1), (T = xe(Jt)));
        }
        let g = T;
        if (m && P !== !1) {
            const b = Object.keys(m),
                { shapeFlag: L } = g;
            b.length &&
                L & 7 &&
                (i && b.some(ks) && (m = Zu(m, i)), (g = Mn(g, m, !1, !0)));
        }
        return (
            n.dirs &&
                ((g = Mn(g, null, !1, !0)),
                (g.dirs = g.dirs ? g.dirs.concat(n.dirs) : n.dirs)),
            n.transition && Vr(g, n.transition),
            (T = g),
            Us(A),
            T
        );
    }
    const Gu = (e) => {
            let t;
            for (const n in e)
                (n === "class" || n === "style" || xs(n)) &&
                    ((t || (t = {}))[n] = e[n]);
            return t;
        },
        Zu = (e, t) => {
            const n = {};
            for (const s in e) (!ks(s) || !(s.slice(9) in t)) && (n[s] = e[s]);
            return n;
        };
    function Qu(e, t, n) {
        const { props: s, children: r, component: i } = e,
            { props: a, children: c, patchFlag: u } = t,
            h = i.emitsOptions;
        if (t.dirs || t.transition) return !0;
        if (n && u >= 0) {
            if (u & 1024) return !0;
            if (u & 16) return s ? na(s, a, h) : !!a;
            if (u & 8) {
                const d = t.dynamicProps;
                for (let v = 0; v < d.length; v++) {
                    const w = d[v];
                    if (sa(a, s, w) && !zs(h, w)) return !0;
                }
            }
        } else
            return (r || c) && (!c || !c.$stable)
                ? !0
                : s === a
                  ? !1
                  : s
                    ? a
                        ? na(s, a, h)
                        : !0
                    : !!a;
        return !1;
    }
    function na(e, t, n) {
        const s = Object.keys(t);
        if (s.length !== Object.keys(e).length) return !0;
        for (let r = 0; r < s.length; r++) {
            const i = s[r];
            if (sa(t, e, i) && !zs(n, i)) return !0;
        }
        return !1;
    }
    function sa(e, t, n) {
        const s = e[n],
            r = t[n];
        return n === "style" && $e(s) && $e(r) ? !Er(s, r) : s !== r;
    }
    function Yu({ vnode: e, parent: t, suspense: n }, s) {
        for (; t; ) {
            const r = t.subTree;
            if (
                (r.suspense &&
                    r.suspense.activeBranch === e &&
                    ((r.suspense.vnode.el = r.el = s), (e = r)),
                r === e)
            )
                (((e = t.vnode).el = s), (t = t.parent));
            else break;
        }
        n && n.activeBranch === e && (n.vnode.el = s);
    }
    const ra = {},
        ia = () => Object.create(ra),
        oa = (e) => Object.getPrototypeOf(e) === ra;
    function ef(e, t, n, s = !1) {
        const r = {},
            i = ia();
        ((e.propsDefaults = Object.create(null)), aa(e, t, r, i));
        for (const a in e.propsOptions[0]) a in r || (r[a] = void 0);
        (n
            ? (e.props = s ? r : iu(r))
            : e.type.props
              ? (e.props = r)
              : (e.props = i),
            (e.attrs = i));
    }
    function tf(e, t, n, s) {
        const {
                props: r,
                attrs: i,
                vnode: { patchFlag: a },
            } = e,
            c = ke(r),
            [u] = e.propsOptions;
        let h = !1;
        if ((s || a > 0) && !(a & 16)) {
            if (a & 8) {
                const d = e.vnode.dynamicProps;
                for (let v = 0; v < d.length; v++) {
                    let w = d[v];
                    if (zs(e.emitsOptions, w)) continue;
                    const C = t[w];
                    if (u)
                        if (Ee(i, w)) C !== i[w] && ((i[w] = C), (h = !0));
                        else {
                            const O = at(w);
                            r[O] = Zr(u, c, O, C, e, !1);
                        }
                    else C !== i[w] && ((i[w] = C), (h = !0));
                }
            }
        } else {
            aa(e, t, r, i) && (h = !0);
            let d;
            for (const v in c)
                (!t || (!Ee(t, v) && ((d = rn(v)) === v || !Ee(t, d)))) &&
                    (u
                        ? n &&
                          (n[v] !== void 0 || n[d] !== void 0) &&
                          (r[v] = Zr(u, c, v, void 0, e, !0))
                        : delete r[v]);
            if (i !== c)
                for (const v in i) (!t || !Ee(t, v)) && (delete i[v], (h = !0));
        }
        h && Ht(e.attrs, "set", "");
    }
    function aa(e, t, n, s) {
        const [r, i] = e.propsOptions;
        let a = !1,
            c;
        if (t)
            for (let u in t) {
                if (Wn(u)) continue;
                const h = t[u];
                let d;
                r && Ee(r, (d = at(u)))
                    ? !i || !i.includes(d)
                        ? (n[d] = h)
                        : ((c || (c = {}))[d] = h)
                    : zs(e.emitsOptions, u) ||
                      ((!(u in s) || h !== s[u]) && ((s[u] = h), (a = !0)));
            }
        if (i) {
            const u = ke(n),
                h = c || Me;
            for (let d = 0; d < i.length; d++) {
                const v = i[d];
                n[v] = Zr(r, u, v, h[v], e, !Ee(h, v));
            }
        }
        return a;
    }
    function Zr(e, t, n, s, r, i) {
        const a = e[n];
        if (a != null) {
            const c = Ee(a, "default");
            if (c && s === void 0) {
                const u = a.default;
                if (a.type !== Function && !a.skipFactory && he(u)) {
                    const { propsDefaults: h } = r;
                    if (n in h) s = h[n];
                    else {
                        const d = os(r);
                        ((s = h[n] = u.call(null, t)), d());
                    }
                } else s = u;
                r.ce && r.ce._setProp(n, s);
            }
            a[0] &&
                (i && !c
                    ? (s = !1)
                    : a[1] && (s === "" || s === rn(n)) && (s = !0));
        }
        return s;
    }
    const nf = new WeakMap();
    function ca(e, t, n = !1) {
        const s = n ? nf : t.propsCache,
            r = s.get(e);
        if (r) return r;
        const i = e.props,
            a = {},
            c = [];
        let u = !1;
        if (!he(e)) {
            const d = (v) => {
                u = !0;
                const [w, C] = ca(v, t, !0);
                (nt(a, w), C && c.push(...C));
            };
            (!n && t.mixins.length && t.mixins.forEach(d),
                e.extends && d(e.extends),
                e.mixins && e.mixins.forEach(d));
        }
        if (!i && !u) return ($e(e) && s.set(e, Sn), Sn);
        if (ue(i))
            for (let d = 0; d < i.length; d++) {
                const v = at(i[d]);
                la(v) && (a[v] = Me);
            }
        else if (i)
            for (const d in i) {
                const v = at(d);
                if (la(v)) {
                    const w = i[d],
                        C = (a[v] = ue(w) || he(w) ? { type: w } : nt({}, w)),
                        O = C.type;
                    let P = !1,
                        A = !0;
                    if (ue(O))
                        for (let T = 0; T < O.length; ++T) {
                            const m = O[T],
                                g = he(m) && m.name;
                            if (g === "Boolean") {
                                P = !0;
                                break;
                            } else g === "String" && (A = !1);
                        }
                    else P = he(O) && O.name === "Boolean";
                    ((C[0] = P),
                        (C[1] = A),
                        (P || Ee(C, "default")) && c.push(v));
                }
            }
        const h = [a, c];
        return ($e(e) && s.set(e, h), h);
    }
    function la(e) {
        return e[0] !== "$" && !Wn(e);
    }
    const Qr = (e) => e === "_" || e === "_ctx" || e === "$stable",
        Yr = (e) => (ue(e) ? e.map(It) : [It(e)]),
        sf = (e, t, n) => {
            if (t._n) return t;
            const s = Wt((...r) => Yr(t(...r)), n);
            return ((s._c = !1), s);
        },
        ua = (e, t, n) => {
            const s = e._ctx;
            for (const r in e) {
                if (Qr(r)) continue;
                const i = e[r];
                if (he(i)) t[r] = sf(r, i, s);
                else if (i != null) {
                    const a = Yr(i);
                    t[r] = () => a;
                }
            }
        },
        fa = (e, t) => {
            const n = Yr(t);
            e.slots.default = () => n;
        },
        da = (e, t, n) => {
            for (const s in t) (n || !Qr(s)) && (e[s] = t[s]);
        },
        rf = (e, t, n) => {
            const s = (e.slots = ia());
            if (e.vnode.shapeFlag & 32) {
                const r = t._;
                r ? (da(s, t, n), n && no(s, "_", r, !0)) : ua(t, s);
            } else t && fa(e, t);
        },
        of = (e, t, n) => {
            const { vnode: s, slots: r } = e;
            let i = !0,
                a = Me;
            if (s.shapeFlag & 32) {
                const c = t._;
                (c
                    ? n && c === 1
                        ? (i = !1)
                        : da(r, t, n)
                    : ((i = !t.$stable), ua(t, r)),
                    (a = t));
            } else t && (fa(e, t), (a = { default: 1 }));
            if (i) for (const c in r) !Qr(c) && a[c] == null && delete r[c];
        },
        ht = ff;
    function af(e) {
        return cf(e);
    }
    function cf(e, t) {
        const n = Es();
        n.__VUE__ = !0;
        const {
                insert: s,
                remove: r,
                patchProp: i,
                createElement: a,
                createText: c,
                createComment: u,
                setText: h,
                setElementText: d,
                parentNode: v,
                nextSibling: w,
                setScopeId: C = Rt,
                insertStaticContent: O,
            } = e,
            P = (
                y,
                x,
                M,
                j = null,
                R = null,
                D = null,
                H = void 0,
                U = null,
                F = !!x.dynamicChildren,
            ) => {
                if (y === x) return;
                (y && !is(y, x) && ((j = ze(y)), Ne(y, R, D, !0), (y = null)),
                    x.patchFlag === -2 &&
                        ((F = !1), (x.dynamicChildren = null)));
                const { type: I, ref: te, shapeFlag: W } = x;
                switch (I) {
                    case Vs:
                        A(y, x, M, j);
                        break;
                    case Jt:
                        T(y, x, M, j);
                        break;
                    case ti:
                        y == null && m(x, M, j, H);
                        break;
                    case be:
                        Q(y, x, M, j, R, D, H, U, F);
                        break;
                    default:
                        W & 1
                            ? L(y, x, M, j, R, D, H, U, F)
                            : W & 6
                              ? K(y, x, M, j, R, D, H, U, F)
                              : (W & 64 || W & 128) &&
                                I.process(y, x, M, j, R, D, H, U, F, He);
                }
                te != null && R
                    ? es(te, y && y.ref, D, x || y, !x)
                    : te == null &&
                      y &&
                      y.ref != null &&
                      es(y.ref, null, D, y, !0);
            },
            A = (y, x, M, j) => {
                if (y == null) s((x.el = c(x.children)), M, j);
                else {
                    const R = (x.el = y.el);
                    x.children !== y.children && h(R, x.children);
                }
            },
            T = (y, x, M, j) => {
                y == null
                    ? s((x.el = u(x.children || "")), M, j)
                    : (x.el = y.el);
            },
            m = (y, x, M, j) => {
                [y.el, y.anchor] = O(y.children, x, M, j, y.el, y.anchor);
            },
            g = ({ el: y, anchor: x }, M, j) => {
                let R;
                for (; y && y !== x; ) ((R = w(y)), s(y, M, j), (y = R));
                s(x, M, j);
            },
            b = ({ el: y, anchor: x }) => {
                let M;
                for (; y && y !== x; ) ((M = w(y)), r(y), (y = M));
                r(x);
            },
            L = (y, x, M, j, R, D, H, U, F) => {
                if (
                    (x.type === "svg"
                        ? (H = "svg")
                        : x.type === "math" && (H = "mathml"),
                    y == null)
                )
                    B(x, M, j, R, D, H, U, F);
                else {
                    const I = y.el && y.el._isVueCE ? y.el : null;
                    try {
                        (I && I._beginPatch(), ie(y, x, R, D, H, U, F));
                    } finally {
                        I && I._endPatch();
                    }
                }
            },
            B = (y, x, M, j, R, D, H, U) => {
                let F, I;
                const { props: te, shapeFlag: W, transition: re, dirs: ce } = y;
                if (
                    ((F = y.el = a(y.type, D, te && te.is, te)),
                    W & 8
                        ? d(F, y.children)
                        : W & 16 &&
                          oe(y.children, F, null, j, R, ei(y, D), H, U),
                    ce && fn(y, null, j, "created"),
                    J(F, y, y.scopeId, H, j),
                    te)
                ) {
                    for (const Ce in te)
                        Ce !== "value" &&
                            !Wn(Ce) &&
                            i(F, Ce, null, te[Ce], D, j);
                    ("value" in te && i(F, "value", null, te.value, D),
                        (I = te.onVnodeBeforeMount) && Ut(I, j, y));
                }
                ce && fn(y, null, j, "beforeMount");
                const ye = lf(R, re);
                (ye && re.beforeEnter(F),
                    s(F, x, M),
                    ((I = te && te.onVnodeMounted) || ye || ce) &&
                        ht(() => {
                            try {
                                (I && Ut(I, j, y),
                                    ye && re.enter(F),
                                    ce && fn(y, null, j, "mounted"));
                            } finally {
                            }
                        }, R));
            },
            J = (y, x, M, j, R) => {
                if ((M && C(y, M), j))
                    for (let D = 0; D < j.length; D++) C(y, j[D]);
                if (R) {
                    let D = R.subTree;
                    if (
                        x === D ||
                        (ga(D.type) &&
                            (D.ssContent === x || D.ssFallback === x))
                    ) {
                        const H = R.vnode;
                        J(y, H, H.scopeId, H.slotScopeIds, R.parent);
                    }
                }
            },
            oe = (y, x, M, j, R, D, H, U, F = 0) => {
                for (let I = F; I < y.length; I++) {
                    const te = (y[I] = U ? Gt(y[I]) : It(y[I]));
                    P(null, te, x, M, j, R, D, H, U);
                }
            },
            ie = (y, x, M, j, R, D, H) => {
                const U = (x.el = y.el);
                let { patchFlag: F, dynamicChildren: I, dirs: te } = x;
                F |= y.patchFlag & 16;
                const W = y.props || Me,
                    re = x.props || Me;
                let ce;
                if (
                    (M && dn(M, !1),
                    (ce = re.onVnodeBeforeUpdate) && Ut(ce, M, x, y),
                    te && fn(x, y, M, "beforeUpdate"),
                    M && dn(M, !0),
                    I &&
                        (!y.dynamicChildren ||
                            y.dynamicChildren.length !== I.length) &&
                        ((F = 0), (H = !1), (I = null)),
                    ((W.innerHTML && re.innerHTML == null) ||
                        (W.textContent && re.textContent == null)) &&
                        d(U, ""),
                    I
                        ? z(y.dynamicChildren, I, U, M, j, ei(x, R), D)
                        : H || Se(y, x, U, null, M, j, ei(x, R), D, !1),
                    F > 0)
                ) {
                    if (F & 16) Z(U, W, re, M, R);
                    else if (
                        (F & 2 &&
                            W.class !== re.class &&
                            i(U, "class", null, re.class, R),
                        F & 4 && i(U, "style", W.style, re.style, R),
                        F & 8)
                    ) {
                        const ye = x.dynamicProps;
                        for (let Ce = 0; Ce < ye.length; Ce++) {
                            const Pe = ye[Ce],
                                de = W[Pe],
                                We = re[Pe];
                            (We !== de || Pe === "value") &&
                                i(U, Pe, de, We, R, M);
                        }
                    }
                    F & 1 && y.children !== x.children && d(U, x.children);
                } else !H && I == null && Z(U, W, re, M, R);
                ((ce = re.onVnodeUpdated) || te) &&
                    ht(() => {
                        (ce && Ut(ce, M, x, y), te && fn(x, y, M, "updated"));
                    }, j);
            },
            z = (y, x, M, j, R, D, H) => {
                for (let U = 0; U < x.length; U++) {
                    const F = y[U],
                        I = x[U],
                        te =
                            F.el &&
                            (F.type === be || !is(F, I) || F.shapeFlag & 198)
                                ? v(F.el)
                                : M;
                    P(F, I, te, null, j, R, D, H, !0);
                }
            },
            Z = (y, x, M, j, R) => {
                if (x !== M) {
                    if (x !== Me)
                        for (const D in x)
                            !Wn(D) && !(D in M) && i(y, D, x[D], null, R, j);
                    for (const D in M) {
                        if (Wn(D)) continue;
                        const H = M[D],
                            U = x[D];
                        H !== U && D !== "value" && i(y, D, U, H, R, j);
                    }
                    "value" in M && i(y, "value", x.value, M.value, R);
                }
            },
            Q = (y, x, M, j, R, D, H, U, F) => {
                const I = (x.el = y ? y.el : c("")),
                    te = (x.anchor = y ? y.anchor : c(""));
                let { patchFlag: W, dynamicChildren: re, slotScopeIds: ce } = x;
                (ce && (U = U ? U.concat(ce) : ce),
                    y == null
                        ? (s(I, M, j),
                          s(te, M, j),
                          oe(x.children || [], M, te, R, D, H, U, F))
                        : W > 0 &&
                            W & 64 &&
                            re &&
                            y.dynamicChildren &&
                            y.dynamicChildren.length === re.length
                          ? (z(y.dynamicChildren, re, M, R, D, H, U),
                            (x.key != null || (R && x === R.subTree)) &&
                                ha(y, x, !0))
                          : Se(y, x, M, te, R, D, H, U, F));
            },
            K = (y, x, M, j, R, D, H, U, F) => {
                ((x.slotScopeIds = U),
                    y == null
                        ? x.shapeFlag & 512
                            ? R.ctx.activate(x, M, j, H, F)
                            : ne(x, M, j, R, D, H, F)
                        : et(y, x, F));
            },
            ne = (y, x, M, j, R, D, H) => {
                const U = (y.component = gf(y, j, R));
                if (
                    (Bo(y) && (U.ctx.renderer = He), yf(U, !1, H), U.asyncDep)
                ) {
                    if ((R && R.registerDep(U, Oe, H), !y.el)) {
                        const F = (U.subTree = xe(Jt));
                        (T(null, F, x, M), (y.placeholder = F.el));
                    }
                } else Oe(U, y, x, M, R, D, H);
            },
            et = (y, x, M) => {
                const j = (x.component = y.component);
                if (Qu(y, x, M))
                    if (j.asyncDep && !j.asyncResolved) {
                        _e(j, x, M);
                        return;
                    } else ((j.next = x), j.update());
                else ((x.el = y.el), (j.vnode = x));
            },
            Oe = (y, x, M, j, R, D, H) => {
                const U = () => {
                    if (y.isMounted) {
                        let {
                            next: W,
                            bu: re,
                            u: ce,
                            parent: ye,
                            vnode: Ce,
                        } = y;
                        {
                            const kt = pa(y);
                            if (kt) {
                                (W && ((W.el = Ce.el), _e(y, W, H)),
                                    kt.asyncDep.then(() => {
                                        ht(() => {
                                            y.isUnmounted || I();
                                        }, R);
                                    }));
                                return;
                            }
                        }
                        let Pe = W,
                            de;
                        (dn(y, !1),
                            W ? ((W.el = Ce.el), _e(y, W, H)) : (W = Ce),
                            re && Ts(re),
                            (de = W.props && W.props.onVnodeBeforeUpdate) &&
                                Ut(de, ye, W, Ce),
                            dn(y, !0));
                        const We = ta(y),
                            xt = y.subTree;
                        ((y.subTree = We),
                            P(xt, We, v(xt.el), ze(xt), y, R, D),
                            (W.el = We.el),
                            Pe === null && Yu(y, We.el),
                            ce && ht(ce, R),
                            (de = W.props && W.props.onVnodeUpdated) &&
                                ht(() => Ut(de, ye, W, Ce), R));
                    } else {
                        let W;
                        const { el: re, props: ce } = x,
                            {
                                bm: ye,
                                m: Ce,
                                parent: Pe,
                                root: de,
                                type: We,
                            } = y,
                            xt = $n(x);
                        (dn(y, !1),
                            ye && Ts(ye),
                            !xt &&
                                (W = ce && ce.onVnodeBeforeMount) &&
                                Ut(W, Pe, x),
                            dn(y, !0));
                        {
                            de.ce &&
                                de.ce._hasShadowRoot() &&
                                de.ce._injectChildStyle(
                                    We,
                                    y.parent ? y.parent.type : void 0,
                                );
                            const kt = (y.subTree = ta(y));
                            (P(null, kt, M, j, y, R, D), (x.el = kt.el));
                        }
                        if (
                            (Ce && ht(Ce, R),
                            !xt && (W = ce && ce.onVnodeMounted))
                        ) {
                            const kt = x;
                            ht(() => Ut(W, Pe, kt), R);
                        }
                        ((x.shapeFlag & 256 ||
                            (Pe && $n(Pe.vnode) && Pe.vnode.shapeFlag & 256)) &&
                            y.a &&
                            ht(y.a, R),
                            (y.isMounted = !0),
                            (x = M = j = null));
                    }
                };
                y.scope.on();
                const F = (y.effect = new co(U));
                y.scope.off();
                const I = (y.update = F.run.bind(F)),
                    te = (y.job = F.runIfDirty.bind(F));
                ((te.i = y),
                    (te.id = y.uid),
                    (F.scheduler = () => qr(te)),
                    dn(y, !0),
                    I());
            },
            _e = (y, x, M) => {
                x.component = y;
                const j = y.vnode.props;
                ((y.vnode = x),
                    (y.next = null),
                    tf(y, x.props, j, M),
                    of(y, x.children, M),
                    Lt(),
                    Ao(y),
                    Mt());
            },
            Se = (y, x, M, j, R, D, H, U, F = !1) => {
                const I = y && y.children,
                    te = y ? y.shapeFlag : 0,
                    W = x.children,
                    { patchFlag: re, shapeFlag: ce } = x;
                if (re > 0) {
                    if (re & 128) {
                        ae(I, W, M, j, R, D, H, U, F);
                        return;
                    } else if (re & 256) {
                        se(I, W, M, j, R, D, H, U, F);
                        return;
                    }
                }
                ce & 8
                    ? (te & 16 && le(I, R, D), W !== I && d(M, W))
                    : te & 16
                      ? ce & 16
                          ? ae(I, W, M, j, R, D, H, U, F)
                          : le(I, R, D, !0)
                      : (te & 8 && d(M, ""),
                        ce & 16 && oe(W, M, j, R, D, H, U, F));
            },
            se = (y, x, M, j, R, D, H, U, F) => {
                ((y = y || Sn), (x = x || Sn));
                const I = y.length,
                    te = x.length,
                    W = Math.min(I, te);
                let re;
                for (re = 0; re < W; re++) {
                    const ce = (x[re] = F ? Gt(x[re]) : It(x[re]));
                    P(y[re], ce, M, null, R, D, H, U, F);
                }
                I > te ? le(y, R, D, !0, !1, W) : oe(x, M, j, R, D, H, U, F, W);
            },
            ae = (y, x, M, j, R, D, H, U, F) => {
                let I = 0;
                const te = x.length;
                let W = y.length - 1,
                    re = te - 1;
                for (; I <= W && I <= re; ) {
                    const ce = y[I],
                        ye = (x[I] = F ? Gt(x[I]) : It(x[I]));
                    if (is(ce, ye)) P(ce, ye, M, null, R, D, H, U, F);
                    else break;
                    I++;
                }
                for (; I <= W && I <= re; ) {
                    const ce = y[W],
                        ye = (x[re] = F ? Gt(x[re]) : It(x[re]));
                    if (is(ce, ye)) P(ce, ye, M, null, R, D, H, U, F);
                    else break;
                    (W--, re--);
                }
                if (I > W) {
                    if (I <= re) {
                        const ce = re + 1,
                            ye = ce < te ? x[ce].el : j;
                        for (; I <= re; )
                            (P(
                                null,
                                (x[I] = F ? Gt(x[I]) : It(x[I])),
                                M,
                                ye,
                                R,
                                D,
                                H,
                                U,
                                F,
                            ),
                                I++);
                    }
                } else if (I > re) for (; I <= W; ) (Ne(y[I], R, D, !0), I++);
                else {
                    const ce = I,
                        ye = I,
                        Ce = new Map();
                    for (I = ye; I <= re; I++) {
                        const dt = (x[I] = F ? Gt(x[I]) : It(x[I]));
                        dt.key != null && Ce.set(dt.key, I);
                    }
                    let Pe,
                        de = 0;
                    const We = re - ye + 1;
                    let xt = !1,
                        kt = 0;
                    const _n = new Array(We);
                    for (I = 0; I < We; I++) _n[I] = 0;
                    for (I = ce; I <= W; I++) {
                        const dt = y[I];
                        if (de >= We) {
                            Ne(dt, R, D, !0);
                            continue;
                        }
                        let St;
                        if (dt.key != null) St = Ce.get(dt.key);
                        else
                            for (Pe = ye; Pe <= re; Pe++)
                                if (_n[Pe - ye] === 0 && is(dt, x[Pe])) {
                                    St = Pe;
                                    break;
                                }
                        St === void 0
                            ? Ne(dt, R, D, !0)
                            : ((_n[St - ye] = I + 1),
                              St >= kt ? (kt = St) : (xt = !0),
                              P(dt, x[St], M, null, R, D, H, U, F),
                              de++);
                    }
                    const mr = xt ? uf(_n) : Sn;
                    for (Pe = mr.length - 1, I = We - 1; I >= 0; I--) {
                        const dt = ye + I,
                            St = x[dt],
                            Hn = x[dt + 1],
                            qn = dt + 1 < te ? Hn.el || ma(Hn) : j;
                        _n[I] === 0
                            ? P(null, St, M, qn, R, D, H, U, F)
                            : xt &&
                              (Pe < 0 || I !== mr[Pe]
                                  ? fe(St, M, qn, 2)
                                  : Pe--);
                    }
                }
            },
            fe = (y, x, M, j, R = null) => {
                const {
                    el: D,
                    type: H,
                    transition: U,
                    children: F,
                    shapeFlag: I,
                } = y;
                if (I & 6) {
                    fe(y.component.subTree, x, M, j);
                    return;
                }
                if (I & 128) {
                    y.suspense.move(x, M, j);
                    return;
                }
                if (I & 64) {
                    H.move(y, x, M, He);
                    return;
                }
                if (H === be) {
                    s(D, x, M);
                    for (let W = 0; W < F.length; W++) fe(F[W], x, M, j);
                    s(y.anchor, x, M);
                    return;
                }
                if (H === ti) {
                    g(y, x, M);
                    return;
                }
                if (j !== 2 && I & 1 && U)
                    if (j === 0)
                        U.persisted && !D[zr]
                            ? s(D, x, M)
                            : (U.beforeEnter(D),
                              s(D, x, M),
                              ht(() => U.enter(D), R));
                    else {
                        const { leave: W, delayLeave: re, afterLeave: ce } = U,
                            ye = () => {
                                y.ctx.isUnmounted ? r(D) : s(D, x, M);
                            },
                            Ce = () => {
                                const Pe = D._isLeaving || !!D[zr];
                                (D._isLeaving && D[zr](!0),
                                    U.persisted && !Pe
                                        ? ye()
                                        : W(D, () => {
                                              (ye(), ce && ce());
                                          }));
                            };
                        re ? re(D, ye, Ce) : Ce();
                    }
                else s(D, x, M);
            },
            Ne = (y, x, M, j = !1, R = !1) => {
                const {
                    type: D,
                    props: H,
                    ref: U,
                    children: F,
                    dynamicChildren: I,
                    shapeFlag: te,
                    patchFlag: W,
                    dirs: re,
                    cacheIndex: ce,
                    memo: ye,
                } = y;
                if (
                    (W === -2 && (R = !1),
                    U != null && (Lt(), es(U, null, M, y, !0), Mt()),
                    ce != null && (x.renderCache[ce] = void 0),
                    te & 256)
                ) {
                    x.ctx.deactivate(y);
                    return;
                }
                const Ce = te & 1 && re,
                    Pe = !$n(y);
                let de;
                if (
                    (Pe && (de = H && H.onVnodeBeforeUnmount) && Ut(de, x, y),
                    te & 6)
                )
                    Re(y.component, M, j);
                else {
                    if (te & 128) {
                        y.suspense.unmount(M, j);
                        return;
                    }
                    (Ce && fn(y, null, x, "beforeUnmount"),
                        te & 64
                            ? y.type.remove(y, x, M, He, j)
                            : I && !I.hasOnce && (D !== be || (W > 0 && W & 64))
                              ? le(I, x, M, !1, !0)
                              : ((D === be && W & 384) || (!R && te & 16)) &&
                                le(F, x, M),
                        j && ft(y));
                }
                const We = ye != null && ce == null;
                ((Pe && (de = H && H.onVnodeUnmounted)) || Ce || We) &&
                    ht(() => {
                        (de && Ut(de, x, y),
                            Ce && fn(y, null, x, "unmounted"),
                            We && (y.el = null));
                    }, M);
            },
            ft = (y) => {
                const { type: x, el: M, anchor: j, transition: R } = y;
                if (x === be) {
                    wt(M, j);
                    return;
                }
                if (x === ti) {
                    b(y);
                    return;
                }
                const D = () => {
                    (r(M), R && !R.persisted && R.afterLeave && R.afterLeave());
                };
                if (y.shapeFlag & 1 && R && !R.persisted) {
                    const { leave: H, delayLeave: U } = R,
                        F = () => H(M, D);
                    U ? U(y.el, D, F) : F();
                } else D();
            },
            wt = (y, x) => {
                let M;
                for (; y !== x; ) ((M = w(y)), r(y), (y = M));
                r(x);
            },
            Re = (y, x, M) => {
                const {
                    bum: j,
                    scope: R,
                    job: D,
                    subTree: H,
                    um: U,
                    m: F,
                    a: I,
                } = y;
                (va(F),
                    va(I),
                    j && Ts(j),
                    R.stop(),
                    D && ((D.flags |= 8), Ne(H, y, x, M)),
                    U && ht(U, x),
                    ht(() => {
                        y.isUnmounted = !0;
                    }, x));
            },
            le = (y, x, M, j = !1, R = !1, D = 0) => {
                for (let H = D; H < y.length; H++) Ne(y[H], x, M, j, R);
            },
            ze = (y) => {
                if (y.shapeFlag & 6) return ze(y.component.subTree);
                if (y.shapeFlag & 128) return y.suspense.next();
                const x = w(y.anchor || y.el),
                    M = x && x[Cu];
                return M ? w(M) : x;
            };
        let Ft = !1;
        const Fe = (y, x, M) => {
                let j;
                (y == null
                    ? x._vnode &&
                      (Ne(x._vnode, null, null, !0), (j = x._vnode.component))
                    : P(x._vnode || null, y, x, null, null, null, M),
                    (x._vnode = y),
                    Ft || ((Ft = !0), Ao(j), $o(), (Ft = !1)));
            },
            He = {
                p: P,
                um: Ne,
                m: fe,
                r: ft,
                mt: ne,
                mc: oe,
                pc: Se,
                pbc: z,
                n: ze,
                o: e,
            };
        return { render: Fe, hydrate: void 0, createApp: Wu(Fe) };
    }
    function ei({ type: e, props: t }, n) {
        return (n === "svg" && e === "foreignObject") ||
            (n === "mathml" &&
                e === "annotation-xml" &&
                t &&
                t.encoding &&
                t.encoding.includes("html"))
            ? void 0
            : n;
    }
    function dn({ effect: e, job: t }, n) {
        n
            ? ((e.flags |= 32), (t.flags |= 4))
            : ((e.flags &= -33), (t.flags &= -5));
    }
    function lf(e, t) {
        return (!e || (e && !e.pendingBranch)) && t && !t.persisted;
    }
    function ha(e, t, n = !1) {
        const s = e.children,
            r = t.children;
        if (ue(s) && ue(r))
            for (let i = 0; i < s.length; i++) {
                const a = s[i];
                let c = r[i];
                (c.shapeFlag & 1 &&
                    !c.dynamicChildren &&
                    ((c.patchFlag <= 0 || c.patchFlag === 32) &&
                        ((c = r[i] = Gt(r[i])), (c.el = a.el)),
                    !n && c.patchFlag !== -2 && ha(a, c)),
                    c.type === Vs &&
                        (c.patchFlag === -1 && (c = r[i] = Gt(c)),
                        (c.el = a.el)),
                    c.type === Jt && !c.el && (c.el = a.el));
            }
    }
    function uf(e) {
        const t = e.slice(),
            n = [0];
        let s, r, i, a, c;
        const u = e.length;
        for (s = 0; s < u; s++) {
            const h = e[s];
            if (h !== 0) {
                if (((r = n[n.length - 1]), e[r] < h)) {
                    ((t[s] = r), n.push(s));
                    continue;
                }
                for (i = 0, a = n.length - 1; i < a; )
                    ((c = (i + a) >> 1), e[n[c]] < h ? (i = c + 1) : (a = c));
                h < e[n[i]] && (i > 0 && (t[s] = n[i - 1]), (n[i] = s));
            }
        }
        for (i = n.length, a = n[i - 1]; i-- > 0; ) ((n[i] = a), (a = t[a]));
        return n;
    }
    function pa(e) {
        const t = e.subTree.component;
        if (t) return t.asyncDep && !t.asyncResolved ? t : pa(t);
    }
    function va(e) {
        if (e) for (let t = 0; t < e.length; t++) e[t].flags |= 8;
    }
    function ma(e) {
        if (e.placeholder) return e.placeholder;
        const t = e.component;
        return t ? ma(t.subTree) : null;
    }
    const ga = (e) => e.__isSuspense;
    function ff(e, t) {
        t && t.pendingBranch
            ? ue(e)
                ? t.effects.push(...e)
                : t.effects.push(e)
            : _u(e);
    }
    const be = Symbol.for("v-fgt"),
        Vs = Symbol.for("v-txt"),
        Jt = Symbol.for("v-cmt"),
        ti = Symbol.for("v-stc"),
        Xt = [];
    let gt = null;
    function E(e = !1) {
        Xt.push((gt = e ? null : []));
    }
    function ni() {
        (Xt.pop(), (gt = Xt[Xt.length - 1] || null));
    }
    let rs = 1;
    function ba(e, t = !1) {
        ((rs += e), e < 0 && gt && t && (gt.hasOnce = !0));
    }
    function ya(e) {
        return (
            (e.dynamicChildren = rs > 0 ? gt || Sn : null),
            ni(),
            rs > 0 && gt && gt.push(e),
            e
        );
    }
    function $(e, t, n, s, r, i) {
        return ya(S(e, t, n, s, r, i, !0));
    }
    function we(e, t, n, s, r) {
        return ya(xe(e, t, n, s, r, !0));
    }
    function si(e) {
        return e ? e.__v_isVNode === !0 : !1;
    }
    function is(e, t) {
        return e.type === t.type && e.key === t.key;
    }
    const _a = ({ key: e }) => e ?? null,
        Ws = ({ ref: e, ref_key: t, ref_for: n }) => (
            typeof e == "number" && (e = "" + e),
            e != null
                ? Ie(e) || Ge(e) || he(e)
                    ? { i: Ze, r: e, k: t, f: !!n }
                    : e
                : null
        );
    function S(
        e,
        t = null,
        n = null,
        s = 0,
        r = null,
        i = e === be ? 0 : 1,
        a = !1,
        c = !1,
    ) {
        const u = {
            __v_isVNode: !0,
            __v_skip: !0,
            type: e,
            props: t,
            key: t && _a(t),
            ref: t && Ws(t),
            scopeId: Mo,
            slotScopeIds: null,
            children: n,
            component: null,
            suspense: null,
            ssContent: null,
            ssFallback: null,
            dirs: null,
            transition: null,
            el: null,
            anchor: null,
            target: null,
            targetStart: null,
            targetAnchor: null,
            staticCount: 0,
            shapeFlag: i,
            patchFlag: s,
            dynamicProps: r,
            dynamicChildren: null,
            appContext: null,
            ctx: Ze,
        };
        return (
            c
                ? (Ks(u, n), i & 128 && e.normalize(u))
                : n && (u.shapeFlag |= Ie(n) ? 8 : 16),
            rs > 0 &&
                !a &&
                gt &&
                (u.patchFlag > 0 || i & 6) &&
                u.patchFlag !== 32 &&
                gt.push(u),
            u
        );
    }
    const xe = df;
    function df(e, t = null, n = null, s = 0, r = null, i = !1) {
        if (((!e || e === qo) && (e = Jt), si(e))) {
            const c = Mn(e, t, !0);
            return (
                n && Ks(c, n),
                rs > 0 &&
                    !i &&
                    gt &&
                    (c.shapeFlag & 6 ? (gt[gt.indexOf(e)] = c) : gt.push(c)),
                (c.patchFlag = -2),
                c
            );
        }
        if ((Cf(e) && (e = e.__vccOpts), t)) {
            t = hf(t);
            let { class: c, style: u } = t;
            (c && !Ie(c) && (t.class = Le(c)),
                $e(u) &&
                    (Fr(u) && !ue(u) && (u = nt({}, u)), (t.style = $t(u))));
        }
        const a = Ie(e)
            ? 1
            : ga(e)
              ? 128
              : Tu(e)
                ? 64
                : $e(e)
                  ? 4
                  : he(e)
                    ? 2
                    : 0;
        return S(e, t, n, s, r, a, i, !0);
    }
    function hf(e) {
        return e ? (Fr(e) || oa(e) ? nt({}, e) : e) : null;
    }
    function Mn(e, t, n = !1, s = !1) {
        const {
                props: r,
                ref: i,
                patchFlag: a,
                children: c,
                transition: u,
            } = e,
            h = t ? pf(r || {}, t) : r,
            d = {
                __v_isVNode: !0,
                __v_skip: !0,
                type: e.type,
                props: h,
                key: h && _a(h),
                ref:
                    t && t.ref
                        ? n && i
                            ? ue(i)
                                ? i.concat(Ws(t))
                                : [i, Ws(t)]
                            : Ws(t)
                        : i,
                scopeId: e.scopeId,
                slotScopeIds: e.slotScopeIds,
                children: c,
                target: e.target,
                targetStart: e.targetStart,
                targetAnchor: e.targetAnchor,
                staticCount: e.staticCount,
                shapeFlag: e.shapeFlag,
                patchFlag: t && e.type !== be ? (a === -1 ? 16 : a | 16) : a,
                dynamicProps: e.dynamicProps,
                dynamicChildren: e.dynamicChildren,
                appContext: e.appContext,
                dirs: e.dirs,
                transition: u,
                component: e.component,
                suspense: e.suspense,
                ssContent: e.ssContent && Mn(e.ssContent),
                ssFallback: e.ssFallback && Mn(e.ssFallback),
                placeholder: e.placeholder,
                el: e.el,
                anchor: e.anchor,
                ctx: e.ctx,
                ce: e.ce,
            };
        return (u && s && Vr(d, u.clone(d)), d);
    }
    function ri(e = " ", t = 0) {
        return xe(Vs, null, e, t);
    }
    function ee(e = "", t = !1) {
        return t ? (E(), we(Jt, null, e)) : xe(Jt, null, e);
    }
    function It(e) {
        return e == null || typeof e == "boolean"
            ? xe(Jt)
            : ue(e)
              ? xe(be, null, e.slice())
              : si(e)
                ? Gt(e)
                : xe(Vs, null, String(e));
    }
    function Gt(e) {
        return (e.el === null && e.patchFlag !== -1) || e.memo ? e : Mn(e);
    }
    function Ks(e, t) {
        let n = 0;
        const { shapeFlag: s } = e;
        if (t == null) t = null;
        else if (ue(t)) n = 16;
        else if (typeof t == "object")
            if (s & 65) {
                const r = t.default;
                r && (r._c && (r._d = !1), Ks(e, r()), r._c && (r._d = !0));
                return;
            } else {
                n = 32;
                const r = t._;
                !r && !oa(t)
                    ? (t._ctx = Ze)
                    : r === 3 &&
                      Ze &&
                      (Ze.slots._ === 1
                          ? (t._ = 1)
                          : ((t._ = 2), (e.patchFlag |= 1024)));
            }
        else if (he(t)) {
            if (s & 65) {
                Ks(e, { default: t });
                return;
            }
            ((t = { default: t, _ctx: Ze }), (n = 32));
        } else ((t = String(t)), s & 64 ? ((n = 16), (t = [ri(t)])) : (n = 8));
        ((e.children = t), (e.shapeFlag |= n));
    }
    function pf(...e) {
        const t = {};
        for (let n = 0; n < e.length; n++) {
            const s = e[n];
            for (const r in s)
                if (r === "class")
                    t.class !== s.class && (t.class = Le([t.class, s.class]));
                else if (r === "style") t.style = $t([t.style, s.style]);
                else if (xs(r)) {
                    const i = t[r],
                        a = s[r];
                    a && i !== a && !(ue(i) && i.includes(a))
                        ? (t[r] = i ? [].concat(i, a) : a)
                        : a == null && i == null && !ks(r) && (t[r] = a);
                } else r !== "" && (t[r] = s[r]);
        }
        return t;
    }
    function Ut(e, t, n, s = null) {
        Pt(e, t, 7, [n, s]);
    }
    const vf = Yo();
    let mf = 0;
    function gf(e, t, n) {
        const s = e.type,
            r = (t ? t.appContext : e.appContext) || vf,
            i = {
                uid: mf++,
                vnode: e,
                type: s,
                parent: t,
                appContext: r,
                root: null,
                next: null,
                subTree: null,
                effect: null,
                update: null,
                job: null,
                scope: new Bl(!0),
                render: null,
                proxy: null,
                exposed: null,
                exposeProxy: null,
                withProxy: null,
                provides: t ? t.provides : Object.create(r.provides),
                ids: t ? t.ids : ["", 0, 0],
                accessCache: null,
                renderCache: [],
                components: null,
                directives: null,
                propsOptions: ca(s, r),
                emitsOptions: ea(s, r),
                emit: null,
                emitted: null,
                propsDefaults: Me,
                inheritAttrs: s.inheritAttrs,
                ctx: Me,
                data: Me,
                props: Me,
                attrs: Me,
                slots: Me,
                refs: Me,
                setupState: Me,
                setupContext: null,
                suspense: n,
                suspenseId: n ? n.pendingId : 0,
                asyncDep: null,
                asyncResolved: !1,
                isMounted: !1,
                isUnmounted: !1,
                isDeactivated: !1,
                bc: null,
                c: null,
                bm: null,
                m: null,
                bu: null,
                u: null,
                um: null,
                bum: null,
                da: null,
                a: null,
                rtg: null,
                rtc: null,
                ec: null,
                sp: null,
            };
        return (
            (i.ctx = { _: i }),
            (i.root = t ? t.root : i),
            (i.emit = Ju.bind(null, i)),
            e.ce && e.ce(i),
            i
        );
    }
    let rt = null;
    const bf = () => rt || Ze;
    let Js, ii;
    {
        const e = Es(),
            t = (n, s) => {
                let r;
                return (
                    (r = e[n]) || (r = e[n] = []),
                    r.push(s),
                    (i) => {
                        r.length > 1 ? r.forEach((a) => a(i)) : r[0](i);
                    }
                );
            };
        ((Js = t("__VUE_INSTANCE_SETTERS__", (n) => (rt = n))),
            (ii = t("__VUE_SSR_SETTERS__", (n) => (as = n))));
    }
    const os = (e) => {
            const t = rt;
            return (
                Js(e),
                e.scope.on(),
                () => {
                    (e.scope.off(), Js(t));
                }
            );
        },
        wa = () => {
            (rt && rt.scope.off(), Js(null));
        };
    function xa(e) {
        return e.vnode.shapeFlag & 4;
    }
    let as = !1;
    function yf(e, t = !1, n = !1) {
        t && ii(t);
        const { props: s, children: r } = e.vnode,
            i = xa(e);
        (ef(e, s, i, t), rf(e, r, n || t));
        const a = i ? _f(e, t) : void 0;
        return (t && ii(!1), a);
    }
    function _f(e, t) {
        const n = e.type;
        ((e.accessCache = Object.create(null)),
            (e.proxy = new Proxy(e.ctx, Uu)));
        const { setup: s } = n;
        if (s) {
            Lt();
            const r = (e.setupContext = s.length > 1 ? xf(e) : null),
                i = os(e),
                a = Pn(s, e, 0, [e.props, r]),
                c = Yi(a);
            if ((Mt(), i(), (c || e.sp) && !$n(e) && jo(e), c)) {
                if ((a.then(wa, wa), t))
                    return a
                        .then((u) => {
                            ka(e, u);
                        })
                        .catch((u) => {
                            Ds(u, e, 0);
                        });
                e.asyncDep = a;
            } else ka(e, a);
        } else Sa(e);
    }
    function ka(e, t, n) {
        (he(t)
            ? e.type.__ssrInlineRender
                ? (e.ssrRender = t)
                : (e.render = t)
            : $e(t) && (e.setupState = Eo(t)),
            Sa(e));
    }
    function Sa(e, t, n) {
        const s = e.type;
        e.render || (e.render = s.render || Rt);
        {
            const r = os(e);
            Lt();
            try {
                Bu(e);
            } finally {
                (Mt(), r());
            }
        }
    }
    const wf = {
        get(e, t) {
            return (st(e, "get", ""), e[t]);
        },
    };
    function xf(e) {
        const t = (n) => {
            e.exposed = n || {};
        };
        return {
            attrs: new Proxy(e.attrs, wf),
            slots: e.slots,
            emit: e.emit,
            expose: t,
        };
    }
    function Xs(e) {
        return e.exposed
            ? e.exposeProxy ||
                  (e.exposeProxy = new Proxy(Eo(ou(e.exposed)), {
                      get(t, n) {
                          if (n in t) return t[n];
                          if (n in ns) return ns[n](e);
                      },
                      has(t, n) {
                          return n in t || n in ns;
                      },
                  }))
            : e.proxy;
    }
    const kf = /(?:^|[-_])\w/g,
        Sf = (e) => e.replace(kf, (t) => t.toUpperCase()).replace(/[-_]/g, "");
    function Ca(e, t = !0) {
        return he(e) ? e.displayName || e.name : e.name || (t && e.__name);
    }
    function Ta(e, t, n = !1) {
        let s = Ca(t);
        if (!s && t.__file) {
            const r = t.__file.match(/([^/\\]+)\.\w+$/);
            r && (s = r[1]);
        }
        if (!s && e) {
            const r = (i) => {
                for (const a in i) if (i[a] === t) return a;
            };
            s =
                r(e.components) ||
                (e.parent && r(e.parent.type.components)) ||
                r(e.appContext.components);
        }
        return s ? Sf(s) : n ? "App" : "Anonymous";
    }
    function Cf(e) {
        return he(e) && "__vccOpts" in e;
    }
    const ve = (e, t) => fu(e, t, as),
        Tf = "3.5.40";
    /**
     * @vue/runtime-dom v3.5.40
     * (c) 2018-present Yuxi (Evan) You and Vue contributors
     * @license MIT
     **/ let oi;
    const Ea = typeof window < "u" && window.trustedTypes;
    if (Ea)
        try {
            oi = Ea.createPolicy("vue", { createHTML: (e) => e });
        } catch {}
    const Pa = oi ? (e) => oi.createHTML(e) : (e) => e,
        Ef = "http://www.w3.org/2000/svg",
        Pf = "http://www.w3.org/1998/Math/MathML",
        Zt = typeof document < "u" ? document : null,
        Oa = Zt && Zt.createElement("template"),
        Of = {
            insert: (e, t, n) => {
                t.insertBefore(e, n || null);
            },
            remove: (e) => {
                const t = e.parentNode;
                t && t.removeChild(e);
            },
            createElement: (e, t, n, s) => {
                const r =
                    t === "svg"
                        ? Zt.createElementNS(Ef, e)
                        : t === "mathml"
                          ? Zt.createElementNS(Pf, e)
                          : n
                            ? Zt.createElement(e, { is: n })
                            : Zt.createElement(e);
                return (
                    e === "select" &&
                        s &&
                        s.multiple != null &&
                        r.setAttribute("multiple", s.multiple),
                    r
                );
            },
            createText: (e) => Zt.createTextNode(e),
            createComment: (e) => Zt.createComment(e),
            setText: (e, t) => {
                e.nodeValue = t;
            },
            setElementText: (e, t) => {
                e.textContent = t;
            },
            parentNode: (e) => e.parentNode,
            nextSibling: (e) => e.nextSibling,
            querySelector: (e) => Zt.querySelector(e),
            setScopeId(e, t) {
                e.setAttribute(t, "");
            },
            insertStaticContent(e, t, n, s, r, i) {
                const a = n ? n.previousSibling : t.lastChild;
                if (r && (r === i || r.nextSibling))
                    for (
                        ;
                        t.insertBefore(r.cloneNode(!0), n),
                            !(r === i || !(r = r.nextSibling));
                    );
                else {
                    Oa.innerHTML = Pa(
                        s === "svg"
                            ? `<svg>${e}</svg>`
                            : s === "mathml"
                              ? `<math>${e}</math>`
                              : e,
                    );
                    const c = Oa.content;
                    if (s === "svg" || s === "mathml") {
                        const u = c.firstChild;
                        for (; u.firstChild; ) c.appendChild(u.firstChild);
                        c.removeChild(u);
                    }
                    t.insertBefore(c, n);
                }
                return [
                    a ? a.nextSibling : t.firstChild,
                    n ? n.previousSibling : t.lastChild,
                ];
            },
        },
        Rf = Symbol("_vtc");
    function Af(e, t, n) {
        const s = e[Rf];
        (s && (t = (t ? [t, ...s] : [...s]).join(" ")),
            t == null
                ? e.removeAttribute("class")
                : n
                  ? e.setAttribute("class", t)
                  : (e.className = t));
    }
    const Ra = Symbol("_vod"),
        $f = Symbol("_vsh"),
        Lf = Symbol(""),
        Mf = /(?:^|;)\s*display\s*:/;
    function Nf(e, t, n) {
        const s = e.style,
            r = Ie(n);
        let i = !1;
        if (n && !r) {
            if (t)
                if (Ie(t))
                    for (const a of t.split(";")) {
                        const c = a.slice(0, a.indexOf(":")).trim();
                        n[c] == null && cs(s, c, "");
                    }
                else for (const a in t) n[a] == null && cs(s, a, "");
            for (const a in n) {
                a === "display" && (i = !0);
                const c = n[a];
                c != null
                    ? jf(e, a, !Ie(t) && t ? t[a] : void 0, c) || cs(s, a, c)
                    : cs(s, a, "");
            }
        } else if (r) {
            if (t !== n) {
                const a = s[Lf];
                (a && (n += ";" + a), (s.cssText = n), (i = Mf.test(n)));
            }
        } else t && e.removeAttribute("style");
        Ra in e &&
            ((e[Ra] = i ? s.display : ""), e[$f] && (s.display = "none"));
    }
    const Aa = /\s*!important$/;
    function cs(e, t, n) {
        if (ue(n)) n.forEach((s) => cs(e, t, s));
        else if ((n == null && (n = ""), t.startsWith("--")))
            e.setProperty(t, n);
        else {
            const s = Df(e, t);
            Aa.test(n)
                ? e.setProperty(rn(s), n.replace(Aa, ""), "important")
                : (e[s] = n);
        }
    }
    const $a = ["Webkit", "Moz", "ms"],
        ai = {};
    function Df(e, t) {
        const n = ai[t];
        if (n) return n;
        let s = at(t);
        if (s !== "filter" && s in e) return (ai[t] = s);
        s = Cs(s);
        for (let r = 0; r < $a.length; r++) {
            const i = $a[r] + s;
            if (i in e) return (ai[t] = i);
        }
        return t;
    }
    function jf(e, t, n, s) {
        return (
            e.tagName === "TEXTAREA" &&
            (t === "width" || t === "height") &&
            Ie(s) &&
            n === s
        );
    }
    const La = "http://www.w3.org/1999/xlink";
    function Ma(e, t, n, s, r, i = Il(t)) {
        s && t.startsWith("xlink:")
            ? n == null
                ? e.removeAttributeNS(La, t.slice(6, t.length))
                : e.setAttributeNS(La, t, n)
            : n == null || (i && !ro(n))
              ? e.removeAttribute(t)
              : e.setAttribute(t, i ? "" : Ct(n) ? String(n) : n);
    }
    function Na(e, t, n, s, r) {
        if (t === "innerHTML" || t === "textContent") {
            n != null && (e[t] = t === "innerHTML" ? Pa(n) : n);
            return;
        }
        const i = e.tagName;
        if (t === "value" && i !== "PROGRESS" && !i.includes("-")) {
            const c = i === "OPTION" ? e.getAttribute("value") || "" : e.value,
                u = n == null ? (e.type === "checkbox" ? "on" : "") : String(n);
            ((c !== u || !("_value" in e)) && (e.value = u),
                n == null && e.removeAttribute(t),
                (e._value = n));
            return;
        }
        let a = !1;
        if (n === "" || n == null) {
            const c = typeof e[t];
            c === "boolean"
                ? (n = ro(n))
                : n == null && c === "string"
                  ? ((n = ""), (a = !0))
                  : c === "number" && ((n = 0), (a = !0));
        }
        try {
            e[t] = n;
        } catch {}
        a && e.removeAttribute(r || t);
    }
    function Nn(e, t, n, s) {
        e.addEventListener(t, n, s);
    }
    function If(e, t, n, s) {
        e.removeEventListener(t, n, s);
    }
    const Da = Symbol("_vei");
    function Uf(e, t, n, s, r = null) {
        const i = e[Da] || (e[Da] = {}),
            a = i[t];
        if (s && a) a.value = s;
        else {
            const [c, u] = Hf(t);
            if (s) {
                const h = (i[t] = Vf(s, r));
                Nn(e, c, h, u);
            } else a && (If(e, c, a, u), (i[t] = void 0));
        }
    }
    const Bf = /(Once|Passive|Capture)$/,
        Ff = /^on:?(?:Once|Passive|Capture)$/;
    function Hf(e) {
        let t, n;
        for (; (n = e.match(Bf)) && !Ff.test(e); )
            (t || (t = {}),
                (e = e.slice(0, e.length - n[1].length)),
                (t[n[1].toLowerCase()] = !0));
        return [e[2] === ":" ? e.slice(3) : rn(e.slice(2)), t];
    }
    let ci = 0;
    const qf = Promise.resolve(),
        zf = () => ci || (qf.then(() => (ci = 0)), (ci = Date.now()));
    function Vf(e, t) {
        const n = (s) => {
            if (!s._vts) s._vts = Date.now();
            else if (s._vts <= n.attached) return;
            const r = n.value;
            if (ue(r)) {
                const i = s.stopImmediatePropagation;
                s.stopImmediatePropagation = () => {
                    (i.call(s), (s._stopped = !0));
                };
                const a = r.slice(),
                    c = [s];
                for (let u = 0; u < a.length && !s._stopped; u++) {
                    const h = a[u];
                    h && Pt(h, t, 5, c);
                }
            } else Pt(r, t, 5, [s]);
        };
        return ((n.value = e), (n.attached = zf()), n);
    }
    const ja = (e) =>
            e.charCodeAt(0) === 111 &&
            e.charCodeAt(1) === 110 &&
            e.charCodeAt(2) > 96 &&
            e.charCodeAt(2) < 123,
        Wf = (e, t, n, s, r, i) => {
            const a = r === "svg";
            t === "class"
                ? Af(e, s, a)
                : t === "style"
                  ? Nf(e, n, s)
                  : xs(t)
                    ? ks(t) || Uf(e, t, n, s, i)
                    : (
                            t[0] === "."
                                ? ((t = t.slice(1)), !0)
                                : t[0] === "^"
                                  ? ((t = t.slice(1)), !1)
                                  : Kf(e, t, s, a)
                        )
                      ? (Na(e, t, s),
                        !e.tagName.includes("-") &&
                            (t === "value" ||
                                t === "checked" ||
                                t === "selected") &&
                            Ma(e, t, s, a, i, t !== "value"))
                      : e._isVueCE &&
                          (Jf(e, t) ||
                              (e._def.__asyncLoader &&
                                  (/[A-Z]/.test(t) || !Ie(s))))
                        ? Na(e, at(t), s, i, t)
                        : (t === "true-value"
                              ? (e._trueValue = s)
                              : t === "false-value" && (e._falseValue = s),
                          Ma(e, t, s, a));
        };
    function Kf(e, t, n, s) {
        if (s)
            return !!(
                t === "innerHTML" ||
                t === "textContent" ||
                (t in e && ja(t) && he(n))
            );
        if (
            t === "spellcheck" ||
            t === "draggable" ||
            t === "translate" ||
            t === "autocorrect" ||
            (t === "sandbox" && e.tagName === "IFRAME") ||
            t === "form" ||
            (t === "list" && e.tagName === "INPUT") ||
            (t === "type" && e.tagName === "TEXTAREA")
        )
            return !1;
        if (t === "width" || t === "height") {
            const r = e.tagName;
            if (
                r === "IMG" ||
                r === "VIDEO" ||
                r === "CANVAS" ||
                r === "SOURCE"
            )
                return !1;
        }
        return ja(t) && Ie(n) ? !1 : t in e;
    }
    function Jf(e, t) {
        const n = e._def.props;
        if (!n) return !1;
        const s = at(t);
        return Array.isArray(n)
            ? n.some((r) => at(r) === s)
            : Object.keys(n).some((r) => at(r) === s);
    }
    const Ia = (e) => {
        const t = e.props["onUpdate:modelValue"] || !1;
        return ue(t) ? (n) => Ts(t, n) : t;
    };
    function Xf(e) {
        e.target.composing = !0;
    }
    function Ua(e) {
        const t = e.target;
        t.composing &&
            ((t.composing = !1), t.dispatchEvent(new Event("input")));
    }
    const li = Symbol("_assign");
    function Ba(e, t, n) {
        return (t && (e = e.trim()), n && (e = Tr(e)), e);
    }
    const Dn = {
            created(e, { modifiers: { lazy: t, trim: n, number: s } }, r) {
                e[li] = Ia(r);
                const i = s || (r.props && r.props.type === "number");
                (Nn(e, t ? "change" : "input", (a) => {
                    a.target.composing || e[li](Ba(e.value, n, i));
                }),
                    (n || i) &&
                        Nn(e, "change", () => {
                            e.value = Ba(e.value, n, i);
                        }),
                    t ||
                        (Nn(e, "compositionstart", Xf),
                        Nn(e, "compositionend", Ua),
                        Nn(e, "change", Ua)));
            },
            mounted(e, { value: t }) {
                e.value = t ?? "";
            },
            beforeUpdate(
                e,
                {
                    value: t,
                    oldValue: n,
                    modifiers: { lazy: s, trim: r, number: i },
                },
                a,
            ) {
                if (((e[li] = Ia(a)), e.composing)) return;
                const c =
                        (i || e.type === "number") && !/^0\d/.test(e.value)
                            ? Tr(e.value)
                            : e.value,
                    u = t ?? "";
                if (c === u) return;
                const h = e.getRootNode();
                ((h instanceof Document || h instanceof ShadowRoot) &&
                    h.activeElement === e &&
                    e.type !== "range" &&
                    ((s && t === n) || (r && e.value.trim() === u))) ||
                    (e.value = u);
            },
        },
        Gf = ["ctrl", "shift", "alt", "meta"],
        Zf = {
            stop: (e) => e.stopPropagation(),
            prevent: (e) => e.preventDefault(),
            self: (e) => e.target !== e.currentTarget,
            ctrl: (e) => !e.ctrlKey,
            shift: (e) => !e.shiftKey,
            alt: (e) => !e.altKey,
            meta: (e) => !e.metaKey,
            left: (e) => "button" in e && e.button !== 0,
            middle: (e) => "button" in e && e.button !== 1,
            right: (e) => "button" in e && e.button !== 2,
            exact: (e, t) => Gf.some((n) => e[`${n}Key`] && !t.includes(n)),
        },
        Gs = (e, t) => {
            if (!e) return e;
            const n = e._withMods || (e._withMods = {}),
                s = t.join(".");
            return (
                n[s] ||
                (n[s] = (r, ...i) => {
                    for (let a = 0; a < t.length; a++) {
                        const c = Zf[t[a]];
                        if (c && c(r, t)) return;
                    }
                    return e(r, ...i);
                })
            );
        },
        Qf = {
            esc: "escape",
            space: " ",
            up: "arrow-up",
            left: "arrow-left",
            right: "arrow-right",
            down: "arrow-down",
            delete: "backspace",
        },
        Yf = (e, t) => {
            const n = e._withKeys || (e._withKeys = {}),
                s = t.join(".");
            return (
                n[s] ||
                (n[s] = (r) => {
                    if (!("key" in r)) return;
                    const i = rn(r.key);
                    if (t.some((a) => a === i || Qf[a] === i)) return e(r);
                })
            );
        },
        ed = nt({ patchProp: Wf }, Of);
    let Fa;
    function td() {
        return Fa || (Fa = af(ed));
    }
    const nd = (...e) => {
        const t = td().createApp(...e),
            { mount: n } = t;
        return (
            (t.mount = (s) => {
                const r = rd(s);
                if (!r) return;
                const i = t._component;
                (!he(i) &&
                    !i.render &&
                    !i.template &&
                    (i.template = r.innerHTML),
                    r.nodeType === 1 && (r.textContent = ""));
                const a = n(r, !1, sd(r));
                return (
                    r instanceof Element &&
                        (r.removeAttribute("v-cloak"),
                        r.setAttribute("data-v-app", "")),
                    a
                );
            }),
            t
        );
    };
    function sd(e) {
        if (e instanceof SVGElement) return "svg";
        if (typeof MathMLElement == "function" && e instanceof MathMLElement)
            return "mathml";
    }
    function rd(e) {
        return Ie(e) ? document.querySelector(e) : e;
    }
    const id = ["src", "alt"],
        Qt = {
            __name: "Avatar",
            props: {
                name: { type: String, default: "" },
                avatarUrl: { type: String, default: null },
                size: { type: Number, default: 40 },
            },
            setup(e) {
                const t = e,
                    n = ve(
                        () =>
                            (t.name || "?")
                                .trim()
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((r) => {
                                    var i;
                                    return (
                                        ((i = r[0]) == null
                                            ? void 0
                                            : i.toUpperCase()) ?? ""
                                    );
                                })
                                .join("") || "?",
                    );
                return (s, r) =>
                    e.avatarUrl
                        ? (E(),
                          $(
                              "img",
                              {
                                  key: 0,
                                  src: e.avatarUrl,
                                  alt: e.name,
                                  class: "cv-avatar rounded-full object-cover",
                                  style: $t({
                                      width: e.size + "px",
                                      height: e.size + "px",
                                  }),
                              },
                              null,
                              12,
                              id,
                          ))
                        : (E(),
                          $(
                              "div",
                              {
                                  key: 1,
                                  class: "cv-avatar flex items-center justify-center rounded-full bg-converse-accent font-medium text-white",
                                  style: $t({
                                      width: e.size + "px",
                                      height: e.size + "px",
                                      fontSize: Math.round(e.size / 2.5) + "px",
                                  }),
                              },
                              X(n.value),
                              5,
                          ));
            },
        };
    function ut(e, t) {
        return e == null || t == null ? null : `${e}:${t}`;
    }
    function Yt(e, t = "chatable") {
        return e ? ut(e[`${t}_type`], e[`${t}_id`]) : null;
    }
    const je = $s({
        currentType: null,
        currentId: null,
        currentKey: null,
        conversations: [],
        activeConversationId: null,
        messagesByConversation: {},
        presenceByUser: {},
        typingByConversation: {},
        usersById: {},
        pinnedByConversation: {},
    });
    function Be() {
        return je;
    }
    function od(e, t) {
        ((je.currentType = e), (je.currentId = t), (je.currentKey = ut(e, t)));
    }
    function Bt(e) {
        const t = je.conversations.findIndex((n) => n.id === e.id);
        t === -1 ? je.conversations.unshift(e) : (je.conversations[t] = e);
    }
    function Ha(e) {
        je.conversations = je.conversations.filter((t) => t.id !== e);
    }
    function ad(e, t) {
        je.messagesByConversation[e] = t;
    }
    function cd(e, t) {
        const n = je.messagesByConversation[e] ?? [];
        je.messagesByConversation[e] = [...t, ...n];
    }
    function en(e, t) {
        const n =
                je.messagesByConversation[e] ??
                (je.messagesByConversation[e] = []),
            s = n.findIndex((r) => r.id === t.id);
        s === -1 ? n.push(t) : (n[s] = t);
    }
    function ui(e, t) {
        const n = je.messagesByConversation[e];
        n && (je.messagesByConversation[e] = n.filter((s) => s.id !== t));
    }
    function qa(e, t, n) {
        const s =
            je.typingByConversation[e] ??
            (je.typingByConversation[e] = new Set());
        n ? s.add(t) : s.delete(t);
    }
    function za(e, t) {
        je.presenceByUser[e] = { ...je.presenceByUser[e], ...t };
    }
    function Zs(e) {
        for (const t of e) je.usersById[ut(t.type, t.id)] = t;
    }
    function ld(e, t) {
        je.pinnedByConversation[e] = t;
    }
    function Va(e, t) {
        const n =
            je.pinnedByConversation[e] ?? (je.pinnedByConversation[e] = []);
        n.some((s) => s.id === t.id) || n.push(t);
    }
    function Wa(e, t) {
        const n = je.pinnedByConversation[e];
        n && (je.pinnedByConversation[e] = n.filter((s) => s.id !== t));
    }
    const Ka = G("chats"),
        Ja = G("all"),
        Qs = G(!1);
    function fi() {
        function e(s) {
            ((Ka.value = s), s !== "chats" && (Qs.value = !1));
        }
        function t(s) {
            Ja.value = s;
        }
        function n() {
            Qs.value = !Qs.value;
        }
        return {
            view: Ka,
            setView: e,
            filter: Ja,
            setFilter: t,
            searchOpen: Qs,
            toggleSearch: n,
        };
    }
    const ud = {
            class: "cv-icon-rail flex w-14 h-full shrink-0 flex-col items-center gap-1 border-r border-converse-border bg-converse-railBg py-3",
        },
        fd = {
            __name: "IconRail",
            emits: ["open-profile"],
            setup(e, { emit: t }) {
                const n = t,
                    s = Be(),
                    { view: r, setView: i, setFilter: a } = fi(),
                    c = ve(() => s.usersById[s.currentKey] ?? null);
                function u() {
                    i("chats");
                }
                function h() {
                    (i("chats"), a("groups"));
                }
                function d() {
                    i("media");
                }
                return (v, w) => {
                    var C, O;
                    return (
                        E(),
                        $("nav", ud, [
                            S(
                                "button",
                                {
                                    type: "button",
                                    title: "Chats",
                                    class: Le([
                                        "cv-icon-rail__button flex h-10 w-10 items-center justify-center rounded-lg",
                                        ge(r) === "chats"
                                            ? "bg-converse-accent/15 text-converse-accent"
                                            : "text-converse-textMuted hover:bg-converse-surfaceHover",
                                    ]),
                                    onClick: u,
                                },
                                [
                                    ...(w[1] ||
                                        (w[1] = [
                                            S(
                                                "svg",
                                                {
                                                    viewBox: "0 0 24 24",
                                                    width: "22",
                                                    height: "22",
                                                    fill: "currentColor",
                                                },
                                                [
                                                    S("path", {
                                                        d: "M12 2C6.48 2 2 6.03 2 11c0 2.4 1.05 4.58 2.77 6.2-.15 1.34-.72 2.55-1.55 3.5a.5.5 0 0 0 .5.8c1.9-.32 3.55-1.18 4.86-2.27C9.5 19.72 10.72 20 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9Z",
                                                    }),
                                                ],
                                                -1,
                                            ),
                                        ])),
                                ],
                                2,
                            ),
                            S(
                                "button",
                                {
                                    type: "button",
                                    title: "Groups",
                                    class: Le([
                                        "cv-icon-rail__button flex h-10 w-10 items-center justify-center rounded-lg",
                                        (ge(r) === "chats",
                                        "text-converse-textMuted hover:bg-converse-surfaceHover"),
                                    ]),
                                    onClick: h,
                                },
                                [
                                    ...(w[2] ||
                                        (w[2] = [
                                            S(
                                                "svg",
                                                {
                                                    viewBox: "0 0 24 24",
                                                    width: "22",
                                                    height: "22",
                                                    fill: "currentColor",
                                                },
                                                [
                                                    S("path", {
                                                        d: "M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 3c-3.31 0-6 1.79-6 4v2h12v-2c0-2.21-2.69-4-6-4Zm7 0c-.34 0-.68.02-1 .07 1.24.91 2 2.16 2 3.93v2h5v-2c0-2.03-2.66-3.65-6-4Z",
                                                    }),
                                                ],
                                                -1,
                                            ),
                                        ])),
                                ],
                                2,
                            ),
                            S(
                                "button",
                                {
                                    type: "button",
                                    title: "Media",
                                    class: Le([
                                        "cv-icon-rail__button flex h-10 w-10 items-center justify-center rounded-lg",
                                        ge(r) === "media"
                                            ? "bg-converse-accent/15 text-converse-accent"
                                            : "text-converse-textMuted hover:bg-converse-surfaceHover",
                                    ]),
                                    onClick: d,
                                },
                                [
                                    ...(w[3] ||
                                        (w[3] = [
                                            S(
                                                "svg",
                                                {
                                                    viewBox: "0 0 24 24",
                                                    width: "22",
                                                    height: "22",
                                                    fill: "currentColor",
                                                },
                                                [
                                                    S("path", {
                                                        d: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-9 11 2.5-3 3.5 4.5H6l3-4Zm-3-5.5A1.5 1.5 0 1 1 8 8a1.5 1.5 0 0 1 0 1.5Z",
                                                    }),
                                                ],
                                                -1,
                                            ),
                                        ])),
                                ],
                                2,
                            ),
                            S(
                                "button",
                                {
                                    type: "button",
                                    title: "Profile",
                                    class: "cv-icon-rail__button mt-auto flex h-10 w-10 items-center justify-center rounded-full hover:ring-2 hover:ring-converse-border",
                                    onClick:
                                        w[0] ||
                                        (w[0] = (P) => n("open-profile")),
                                },
                                [
                                    xe(
                                        Qt,
                                        {
                                            name:
                                                ((C = c.value) == null
                                                    ? void 0
                                                    : C.name) ?? "",
                                            "avatar-url":
                                                (O = c.value) == null
                                                    ? void 0
                                                    : O.avatar_url,
                                            size: 32,
                                        },
                                        null,
                                        8,
                                        ["name", "avatar-url"],
                                    ),
                                ],
                            ),
                        ])
                    );
                };
            },
        },
        dd = {
            class: "cv-presence-dot inline-flex items-center gap-1 text-xs text-converse-textMuted",
        },
        hd = {
            key: 0,
            class: "cv-presence-dot__indicator h-2 w-2 rounded-full bg-converse-accent",
        },
        pd = { key: 1 },
        vd = {
            __name: "PresenceDot",
            props: { chatableKey: { type: String, required: !0 } },
            setup(e) {
                const t = e,
                    n = Be(),
                    s = ve(() => n.presenceByUser[t.chatableKey]),
                    r = ve(() => {
                        if (!s.value) return null;
                        if (s.value.is_online) return "online";
                        if (!s.value.last_seen_at) return null;
                        const i =
                                Date.now() -
                                new Date(s.value.last_seen_at).getTime(),
                            a = Math.round(i / 6e4);
                        if (a < 1) return "last seen just now";
                        if (a < 60) return `last seen ${a}m ago`;
                        const c = Math.round(a / 60);
                        return c < 24
                            ? `last seen ${c}h ago`
                            : `last seen ${Math.round(c / 24)}d ago`;
                    });
                return (i, a) => {
                    var c;
                    return (
                        E(),
                        $("span", dd, [
                            (c = s.value) != null && c.is_online
                                ? (E(), $("span", hd))
                                : ee("", !0),
                            r.value
                                ? (E(), $("span", pd, X(r.value), 1))
                                : ee("", !0),
                        ])
                    );
                };
            },
        },
        md = {
            key: 0,
            class: "cv-conversation-menu__dropdown absolute right-0 z-20 w-40 rounded-cv border border-converse-border bg-converse-surface py-1 text-sm shadow-lg",
        },
        gd = {
            __name: "ConversationMenu",
            props: {
                pinned: { type: Boolean, default: !1 },
                muted: { type: Boolean, default: !1 },
                isGroup: { type: Boolean, default: !1 },
            },
            emits: ["mute", "unmute", "pin", "unpin", "delete", "leave"],
            setup(e, { emit: t }) {
                const n = t,
                    s = G(!1),
                    r = G(null);
                function i(c) {
                    ((s.value = !1), n(c));
                }
                function a(c) {
                    r.value && !r.value.contains(c.target) && (s.value = !1);
                }
                return (
                    Qe(s, (c) => {
                        c
                            ? document.addEventListener("click", a)
                            : document.removeEventListener("click", a);
                    }),
                    Wr(() => document.removeEventListener("click", a)),
                    (c, u) => (
                        E(),
                        $(
                            "div",
                            {
                                ref_key: "root",
                                ref: r,
                                class: "cv-conversation-menu relative",
                                onClick:
                                    u[5] || (u[5] = Gs(() => {}, ["stop"])),
                            },
                            [
                                S(
                                    "button",
                                    {
                                        type: "button",
                                        class: "cv-conversation-menu__trigger px-1 text-lg leading-none text-converse-textMuted hover:text-converse-text",
                                        title: "Conversation options",
                                        onClick:
                                            u[0] ||
                                            (u[0] = (h) =>
                                                (s.value = !s.value)),
                                    },
                                    " ⋮ ",
                                ),
                                s.value
                                    ? (E(),
                                      $("div", md, [
                                          S(
                                              "button",
                                              {
                                                  type: "button",
                                                  class: "cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-text hover:bg-converse-surfaceHover",
                                                  onClick:
                                                      u[1] ||
                                                      (u[1] = (h) =>
                                                          i(
                                                              e.muted
                                                                  ? "unmute"
                                                                  : "mute",
                                                          )),
                                              },
                                              X(e.muted ? "Unmute" : "Mute"),
                                              1,
                                          ),
                                          S(
                                              "button",
                                              {
                                                  type: "button",
                                                  class: "cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-text hover:bg-converse-surfaceHover",
                                                  onClick:
                                                      u[2] ||
                                                      (u[2] = (h) =>
                                                          i(
                                                              e.pinned
                                                                  ? "unpin"
                                                                  : "pin",
                                                          )),
                                              },
                                              X(e.pinned ? "Unpin" : "Pin"),
                                              1,
                                          ),
                                          S(
                                              "button",
                                              {
                                                  type: "button",
                                                  class: "cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-danger hover:bg-converse-surfaceHover",
                                                  onClick:
                                                      u[3] ||
                                                      (u[3] = (h) =>
                                                          i("delete")),
                                              },
                                              " Delete chat ",
                                          ),
                                          e.isGroup
                                              ? (E(),
                                                $(
                                                    "button",
                                                    {
                                                        key: 0,
                                                        type: "button",
                                                        class: "cv-conversation-menu__item block w-full px-3 py-1.5 text-left text-converse-danger hover:bg-converse-surfaceHover",
                                                        onClick:
                                                            u[4] ||
                                                            (u[4] = (h) =>
                                                                i("leave")),
                                                    },
                                                    " Leave group ",
                                                ))
                                              : ee("", !0),
                                      ]))
                                    : ee("", !0),
                            ],
                            512,
                        )
                    )
                );
            },
        },
        bd = { key: 0 },
        yd = { key: 1 },
        _d = { key: 2 },
        Xa = {
            __name: "ReadReceiptTicks",
            props: { status: { type: String, default: "sent" } },
            setup(e) {
                return (t, n) => (
                    E(),
                    $(
                        "span",
                        {
                            class: Le([
                                "cv-read-receipt-ticks ml-1 inline-block text-xs",
                                e.status === "read"
                                    ? "text-converse-info"
                                    : "text-converse-textMuted",
                            ]),
                        },
                        [
                            e.status === "sending"
                                ? (E(), $("span", bd, "🕓"))
                                : e.status === "sent"
                                  ? (E(), $("span", yd, "✓"))
                                  : (E(), $("span", _d, "✓✓")),
                        ],
                        2,
                    )
                );
            },
        };
    function Ga(e, t) {
        return function () {
            return e.apply(t, arguments);
        };
    }
    const { toString: wd } = Object.prototype,
        { getPrototypeOf: jn } = Object,
        { iterator: ls, toStringTag: Za } = Symbol,
        Ys = (
            ({ hasOwnProperty: e }) =>
            (t, n) =>
                e.call(t, n)
        )(Object.prototype),
        us = (e, t) => {
            let n = e;
            const s = [];
            for (; n != null && n !== Object.prototype; ) {
                if (s.indexOf(n) !== -1) return !1;
                if ((s.push(n), Ys(n, t))) return !0;
                n = jn(n);
            }
            return !1;
        },
        xd = (e, t) => (e != null && us(e, t) ? e[t] : void 0),
        di = ((e) => (t) => {
            const n = wd.call(t);
            return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
        })(Object.create(null)),
        _t = (e) => ((e = e.toLowerCase()), (t) => di(t) === e),
        er = (e) => (t) => typeof t === e,
        { isArray: hn } = Array,
        pn = er("undefined");
    function In(e) {
        return (
            e !== null &&
            !pn(e) &&
            e.constructor !== null &&
            !pn(e.constructor) &&
            pt(e.constructor.isBuffer) &&
            e.constructor.isBuffer(e)
        );
    }
    const Qa = _t("ArrayBuffer");
    function kd(e) {
        let t;
        return (
            typeof ArrayBuffer < "u" && ArrayBuffer.isView
                ? (t = ArrayBuffer.isView(e))
                : (t = e && e.buffer && Qa(e.buffer)),
            t
        );
    }
    const Sd = er("string"),
        pt = er("function"),
        Ya = er("number"),
        Un = (e) => e !== null && typeof e == "object",
        Cd = (e) => e === !0 || e === !1,
        tr = (e) => {
            if (!Un(e)) return !1;
            const t = jn(e);
            return (
                (t === null || t === Object.prototype || jn(t) === null) &&
                !us(e, Za) &&
                !us(e, ls)
            );
        },
        Td = (e) => {
            if (!Un(e) || In(e)) return !1;
            try {
                return (
                    Object.keys(e).length === 0 &&
                    Object.getPrototypeOf(e) === Object.prototype
                );
            } catch {
                return !1;
            }
        },
        Ed = _t("Date"),
        Pd = _t("File"),
        Od = (e) => !!(e && typeof e.uri < "u"),
        Rd = (e) => e && typeof e.getParts < "u",
        Ad = _t("Blob"),
        $d = _t("FileList"),
        Ld = _t("Set"),
        Md = (e) => Un(e) && pt(e.pipe);
    function Nd() {
        return typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : typeof window < "u"
                ? window
                : typeof global < "u"
                  ? global
                  : {};
    }
    const ec = Nd(),
        tc = typeof ec.FormData < "u" ? ec.FormData : void 0,
        Dd = (e) => {
            if (!e) return !1;
            if (tc && e instanceof tc) return !0;
            const t = jn(e);
            if (!t || t === Object.prototype || !pt(e.append)) return !1;
            const n = di(e);
            return (
                n === "formdata" ||
                (n === "object" &&
                    pt(e.toString) &&
                    e.toString() === "[object FormData]")
            );
        },
        jd = _t("URLSearchParams"),
        [Id, Ud, Bd, Fd] = [
            "ReadableStream",
            "Request",
            "Response",
            "Headers",
        ].map(_t),
        Hd = (e) =>
            e.trim
                ? e.trim()
                : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    function fs(e, t, { allOwnKeys: n = !1 } = {}) {
        if (e === null || typeof e > "u") return;
        let s, r;
        if ((typeof e != "object" && (e = [e]), hn(e)))
            for (s = 0, r = e.length; s < r; s++) t.call(null, e[s], s, e);
        else {
            if (In(e)) return;
            const i = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
                a = i.length;
            let c;
            for (s = 0; s < a; s++) ((c = i[s]), t.call(null, e[c], c, e));
        }
    }
    function nc(e, t) {
        if (In(e)) return null;
        t = t.toLowerCase();
        const n = Object.keys(e);
        let s = n.length,
            r;
        for (; s-- > 0; ) if (((r = n[s]), t === r.toLowerCase())) return r;
        return null;
    }
    const vn =
            typeof globalThis < "u"
                ? globalThis
                : typeof self < "u"
                  ? self
                  : typeof window < "u"
                    ? window
                    : global,
        sc = (e) => !pn(e) && e !== vn;
    function hi(...e) {
        const { caseless: t, skipUndefined: n } = (sc(this) && this) || {},
            s = {},
            r = (i, a) => {
                if (
                    a === "__proto__" ||
                    a === "constructor" ||
                    a === "prototype"
                )
                    return;
                const c = (t && typeof a == "string" && nc(s, a)) || a,
                    u = Ys(s, c) ? s[c] : void 0;
                tr(u) && tr(i)
                    ? (s[c] = hi(u, i))
                    : tr(i)
                      ? (s[c] = hi({}, i))
                      : hn(i)
                        ? (s[c] = i.slice())
                        : (!n || !pn(i)) && (s[c] = i);
            };
        for (let i = 0, a = e.length; i < a; i++) {
            const c = e[i];
            if (!c || In(c) || (fs(c, r), typeof c != "object" || hn(c)))
                continue;
            const u = Object.getOwnPropertySymbols(c);
            for (let h = 0; h < u.length; h++) {
                const d = u[h];
                eh.call(c, d) && r(c[d], d);
            }
        }
        return s;
    }
    const qd = (e, t, n, { allOwnKeys: s } = {}) => (
            fs(
                t,
                (r, i) => {
                    n && pt(r)
                        ? Object.defineProperty(e, i, {
                              __proto__: null,
                              value: Ga(r, n),
                              writable: !0,
                              enumerable: !0,
                              configurable: !0,
                          })
                        : Object.defineProperty(e, i, {
                              __proto__: null,
                              value: r,
                              writable: !0,
                              enumerable: !0,
                              configurable: !0,
                          });
                },
                { allOwnKeys: s },
            ),
            e
        ),
        zd = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e),
        Vd = (e, t, n, s) => {
            ((e.prototype = Object.create(t.prototype, s)),
                Object.defineProperty(e.prototype, "constructor", {
                    __proto__: null,
                    value: e,
                    writable: !0,
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e, "super", {
                    __proto__: null,
                    value: t.prototype,
                }),
                n && Object.assign(e.prototype, n));
        },
        Wd = (e, t, n, s) => {
            let r, i, a;
            const c = {};
            if (((t = t || {}), e == null)) return t;
            do {
                for (r = Object.getOwnPropertyNames(e), i = r.length; i-- > 0; )
                    ((a = r[i]),
                        (!s || s(a, e, t)) &&
                            !c[a] &&
                            ((t[a] = e[a]), (c[a] = !0)));
                e = n !== !1 && jn(e);
            } while (e && (!n || n(e, t)) && e !== Object.prototype);
            return t;
        },
        Kd = (e, t, n) => {
            ((e = String(e)),
                (n === void 0 || n > e.length) && (n = e.length),
                (n -= t.length));
            const s = e.indexOf(t, n);
            return s !== -1 && s === n;
        },
        Jd = (e) => {
            if (!e) return null;
            if (hn(e)) return e;
            let t = e.length;
            if (!Ya(t)) return null;
            const n = new Array(t);
            for (; t-- > 0; ) n[t] = e[t];
            return n;
        },
        Xd = (
            (e) => (t) =>
                e && t instanceof e
        )(typeof Uint8Array < "u" && jn(Uint8Array)),
        Gd = (e, t) => {
            const s = (e && e[ls]).call(e);
            let r;
            for (; (r = s.next()) && !r.done; ) {
                const i = r.value;
                t.call(e, i[0], i[1]);
            }
        },
        Zd = (e, t) => {
            let n;
            const s = [];
            for (; (n = e.exec(t)) !== null; ) s.push(n);
            return s;
        },
        Qd = _t("HTMLFormElement"),
        Yd = (e) =>
            e
                .toLowerCase()
                .replace(/[-_\s]([a-z\d])(\w*)/g, function (n, s, r) {
                    return s.toUpperCase() + r;
                }),
        { propertyIsEnumerable: eh } = Object.prototype,
        th = _t("RegExp"),
        rc = (e, t) => {
            const n = Object.getOwnPropertyDescriptors(e),
                s = {};
            (fs(n, (r, i) => {
                let a;
                (a = t(r, i, e)) !== !1 && (s[i] = a || r);
            }),
                Object.defineProperties(e, s));
        },
        nh = (e) => {
            rc(e, (t, n) => {
                if (pt(e) && ["arguments", "caller", "callee"].includes(n))
                    return !1;
                const s = e[n];
                if (pt(s)) {
                    if (((t.enumerable = !1), "writable" in t)) {
                        t.writable = !1;
                        return;
                    }
                    t.set ||
                        (t.set = () => {
                            throw Error(
                                "Can not rewrite read-only method '" + n + "'",
                            );
                        });
                }
            });
        },
        sh = (e, t) => {
            const n = {},
                s = (r) => {
                    r.forEach((i) => {
                        n[i] = !0;
                    });
                };
            return (hn(e) ? s(e) : s(String(e).split(t)), n);
        },
        rh = () => {},
        ih = (e, t) => (e != null && Number.isFinite((e = +e)) ? e : t);
    function oh(e) {
        return !!(e && pt(e.append) && e[Za] === "FormData" && e[ls]);
    }
    const ah = (e) => {
            const t = new WeakSet(),
                n = (s) => {
                    if (Un(s)) {
                        if (t.has(s)) return;
                        if (In(s)) return s;
                        if (!("toJSON" in s)) {
                            t.add(s);
                            let r;
                            if (Ld(s)) {
                                r = [];
                                for (const i of s) {
                                    const a = n(i);
                                    !pn(a) && r.push(a);
                                }
                            } else
                                ((r = hn(s) ? [] : {}),
                                    fs(s, (i, a) => {
                                        const c = n(i);
                                        !pn(c) && (r[a] = c);
                                    }));
                            return (t.delete(s), r);
                        }
                    }
                    return s;
                };
            return n(e);
        },
        ch = _t("AsyncFunction"),
        lh = (e) => e && (Un(e) || pt(e)) && pt(e.then) && pt(e.catch),
        ic = ((e, t) =>
            e
                ? setImmediate
                : t
                  ? ((n, s) => (
                        vn.addEventListener(
                            "message",
                            ({ source: r, data: i }) => {
                                r === vn && i === n && s.length && s.shift()();
                            },
                            !1,
                        ),
                        (r) => {
                            (s.push(r), vn.postMessage(n, "*"));
                        }
                    ))(`axios@${Math.random()}`, [])
                  : (n) => setTimeout(n))(
            typeof setImmediate == "function",
            pt(vn.postMessage),
        ),
        uh =
            typeof queueMicrotask < "u"
                ? queueMicrotask.bind(vn)
                : (typeof process < "u" && process.nextTick) || ic,
        oc = (e) => e != null && pt(e[ls]),
        k = {
            isArray: hn,
            isArrayBuffer: Qa,
            isBuffer: In,
            isFormData: Dd,
            isArrayBufferView: kd,
            isString: Sd,
            isNumber: Ya,
            isBoolean: Cd,
            isObject: Un,
            isPlainObject: tr,
            isEmptyObject: Td,
            isReadableStream: Id,
            isRequest: Ud,
            isResponse: Bd,
            isHeaders: Fd,
            isUndefined: pn,
            isDate: Ed,
            isFile: Pd,
            isReactNativeBlob: Od,
            isReactNative: Rd,
            isBlob: Ad,
            isRegExp: th,
            isFunction: pt,
            isStream: Md,
            isURLSearchParams: jd,
            isTypedArray: Xd,
            isFileList: $d,
            forEach: fs,
            merge: hi,
            extend: qd,
            trim: Hd,
            stripBOM: zd,
            inherits: Vd,
            toFlatObject: Wd,
            kindOf: di,
            kindOfTest: _t,
            endsWith: Kd,
            toArray: Jd,
            forEachEntry: Gd,
            matchAll: Zd,
            isHTMLForm: Qd,
            hasOwnProperty: Ys,
            hasOwnProp: Ys,
            hasOwnInPrototypeChain: us,
            getSafeProp: xd,
            reduceDescriptors: rc,
            freezeMethods: nh,
            toObjectSet: sh,
            toCamelCase: Yd,
            noop: rh,
            toFiniteNumber: ih,
            findKey: nc,
            global: vn,
            isContextDefined: sc,
            isSpecCompliantForm: oh,
            toJSONObject: ah,
            isAsyncFn: ch,
            isThenable: lh,
            setImmediate: ic,
            asap: uh,
            isIterable: oc,
            isSafeIterable: (e) => e != null && us(e, ls) && oc(e),
        },
        fh = k.toObjectSet([
            "age",
            "authorization",
            "content-length",
            "content-type",
            "etag",
            "expires",
            "from",
            "host",
            "if-modified-since",
            "if-unmodified-since",
            "last-modified",
            "location",
            "max-forwards",
            "proxy-authorization",
            "referer",
            "retry-after",
            "user-agent",
        ]),
        dh = (e) => {
            const t = {};
            let n, s, r;
            return (
                e &&
                    e
                        .split(
                            `
`,
                        )
                        .forEach(function (a) {
                            ((r = a.indexOf(":")),
                                (n = a.substring(0, r).trim().toLowerCase()),
                                (s = a.substring(r + 1).trim()));
                            const c = k.hasOwnProp(t, n);
                            !n ||
                                (c && k.hasOwnProp(fh, n)) ||
                                (n === "set-cookie"
                                    ? c
                                        ? t[n].push(s)
                                        : (t[n] = [s])
                                    : (t[n] = c ? t[n] + ", " + s : s));
                        }),
                t
            );
        };
    function hh(e) {
        let t = 0,
            n = e.length;
        for (; t < n; ) {
            const s = e.charCodeAt(t);
            if (s !== 9 && s !== 32) break;
            t += 1;
        }
        for (; n > t; ) {
            const s = e.charCodeAt(n - 1);
            if (s !== 9 && s !== 32) break;
            n -= 1;
        }
        return t === 0 && n === e.length ? e : e.slice(t, n);
    }
    const ph = new RegExp("[\\u0000-\\u0008\\u000a-\\u001f\\u007f]+", "g"),
        vh = new RegExp("[^\\u0009\\u0020-\\u007e\\u0080-\\u00ff]+", "g");
    function pi(e, t) {
        return k.isArray(e)
            ? e.map((n) => pi(n, t))
            : hh(String(e).replace(t, ""));
    }
    const mh = (e) => pi(e, ph),
        gh = (e) => pi(e, vh);
    function ac(e) {
        const t = Object.create(null);
        return (
            k.forEach(e.toJSON(), (n, s) => {
                t[s] = gh(n);
            }),
            t
        );
    }
    const cc = Symbol("internals");
    function ds(e) {
        return e && String(e).trim().toLowerCase();
    }
    function nr(e) {
        return e === !1 || e == null
            ? e
            : k.isArray(e)
              ? e.map(nr)
              : mh(String(e));
    }
    function bh(e) {
        const t = Object.create(null),
            n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
        let s;
        for (; (s = n.exec(e)); ) t[s[1]] = s[2];
        return t;
    }
    const yh = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    function vi(e) {
        let t = 0,
            n = e.length;
        for (; t < n; ) {
            const s = e.charCodeAt(t);
            if (s !== 9 && s !== 32) break;
            t += 1;
        }
        for (; n > t; ) {
            const s = e.charCodeAt(n - 1);
            if (s !== 9 && s !== 32) break;
            n -= 1;
        }
        return t === 0 && n === e.length ? e : e.slice(t, n);
    }
    function _h(e) {
        const t = e.length - 1;
        if (t < 1 || e.charCodeAt(0) !== 34 || e.charCodeAt(t) !== 34) return e;
        let n = "";
        for (let s = 1; s < t; s++) {
            const r = e.charCodeAt(s);
            if (r === 34 || (r === 92 && ((s += 1), s >= t))) return e;
            n += e[s];
        }
        return n;
    }
    function wh(e) {
        const t = Object.create(null),
            n = String(e);
        let s = 0,
            r = !1,
            i = !1;
        function a(c) {
            const u = vi(n.slice(s, c)),
                h = u.indexOf("=");
            if (h < 1) return;
            const d = vi(u.slice(0, h));
            if (!yh.test(d)) return;
            const v = d.toLowerCase();
            if (v === "__proto__" || v === "constructor" || v === "prototype")
                return;
            const w = vi(u.slice(h + 1));
            t[v] = _h(w);
        }
        for (let c = 0; c < n.length; c++) {
            const u = n.charCodeAt(c);
            r
                ? i
                    ? (i = !1)
                    : u === 92
                      ? (i = !0)
                      : u === 34 && (r = !1)
                : u === 34
                  ? (r = !0)
                  : (u === 44 || u === 59) && (a(c), (s = c + 1));
        }
        return (a(n.length), t);
    }
    const xh = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
    function mi(e, t, n, s, r) {
        if (k.isFunction(s)) return s.call(this, t, n);
        if ((r && (t = n), !!k.isString(t))) {
            if (k.isString(s)) return t.indexOf(s) !== -1;
            if (k.isRegExp(s)) return s.test(t);
        }
    }
    function kh(e) {
        return e
            .trim()
            .toLowerCase()
            .replace(/([a-z\d])(\w*)/g, (t, n, s) => n.toUpperCase() + s);
    }
    function Sh(e, t) {
        const n = k.toCamelCase(" " + t);
        ["get", "set", "has"].forEach((s) => {
            Object.defineProperty(e, s + n, {
                __proto__: null,
                value: function (r, i, a) {
                    return this[s].call(this, t, r, i, a);
                },
                configurable: !0,
            });
        });
    }
    let it = class {
        constructor(t) {
            t && this.set(t);
        }
        set(t, n, s) {
            const r = this;
            function i(c, u, h) {
                const d = ds(u);
                if (!d) return;
                const v = k.findKey(r, d);
                (!v ||
                    r[v] === void 0 ||
                    h === !0 ||
                    (h === void 0 && r[v] !== !1)) &&
                    (r[v || u] = nr(c));
            }
            const a = (c, u) => k.forEach(c, (h, d) => i(h, d, u));
            if (k.isPlainObject(t) || t instanceof this.constructor) a(t, n);
            else if (k.isString(t) && (t = t.trim()) && !xh(t)) a(dh(t), n);
            else if (k.isObject(t) && k.isSafeIterable(t)) {
                let c = Object.create(null),
                    u,
                    h;
                for (const d of t) {
                    if (!k.isArray(d))
                        throw new TypeError(
                            "Object iterator must return a key-value pair",
                        );
                    ((h = d[0]),
                        k.hasOwnProp(c, h)
                            ? ((u = c[h]),
                              (c[h] = k.isArray(u) ? [...u, d[1]] : [u, d[1]]))
                            : (c[h] = d[1]));
                }
                a(c, n);
            } else t != null && i(n, t, s);
            return this;
        }
        get(t, n) {
            if (((t = ds(t)), t)) {
                const s = k.findKey(this, t);
                if (s) {
                    const r = this[s];
                    if (!n) return r;
                    if (n === !0) return bh(r);
                    if (k.isFunction(n)) return n.call(this, r, s);
                    if (k.isRegExp(n)) return n.exec(r);
                    throw new TypeError(
                        "parser must be boolean|regexp|function",
                    );
                }
            }
        }
        has(t, n) {
            if (((t = ds(t)), t)) {
                const s = k.findKey(this, t);
                return !!(
                    s &&
                    this[s] !== void 0 &&
                    (!n || mi(this, this[s], s, n))
                );
            }
            return !1;
        }
        delete(t, n) {
            const s = this;
            let r = !1;
            function i(a) {
                if (((a = ds(a)), a)) {
                    const c = k.findKey(s, a);
                    c && (!n || mi(s, s[c], c, n)) && (delete s[c], (r = !0));
                }
            }
            return (k.isArray(t) ? t.forEach(i) : i(t), r);
        }
        clear(t) {
            const n = Object.keys(this);
            let s = n.length,
                r = !1;
            for (; s--; ) {
                const i = n[s];
                (!t || mi(this, this[i], i, t, !0)) &&
                    (delete this[i], (r = !0));
            }
            return r;
        }
        normalize(t) {
            const n = this,
                s = {};
            return (
                k.forEach(this, (r, i) => {
                    const a = k.findKey(s, i);
                    if (a) {
                        ((n[a] = nr(r)), delete n[i]);
                        return;
                    }
                    const c = t ? kh(i) : String(i).trim();
                    (c !== i && delete n[i], (n[c] = nr(r)), (s[c] = !0));
                }),
                this
            );
        }
        concat(...t) {
            return this.constructor.concat(this, ...t);
        }
        toJSON(t) {
            const n = Object.create(null);
            return (
                k.forEach(this, (s, r) => {
                    s != null &&
                        s !== !1 &&
                        (n[r] = t && k.isArray(s) ? s.join(", ") : s);
                }),
                n
            );
        }
        [Symbol.iterator]() {
            return Object.entries(this.toJSON())[Symbol.iterator]();
        }
        toString() {
            return Object.entries(this.toJSON()).map(([t, n]) => t + ": " + n)
                .join(`
`);
        }
        getSetCookie() {
            const t = this.get("set-cookie");
            return k.isArray(t) ? t : t == null || t === !1 ? [] : [t];
        }
        get [Symbol.toStringTag]() {
            return "AxiosHeaders";
        }
        static from(t) {
            return t instanceof this ? t : new this(t);
        }
        static parseParameters(t) {
            return wh(t);
        }
        static concat(t, ...n) {
            const s = new this(t);
            return (n.forEach((r) => s.set(r)), s);
        }
        static accessor(t) {
            const s = (this[cc] = this[cc] = { accessors: {} }).accessors,
                r = this.prototype;
            function i(a) {
                const c = ds(a);
                s[c] || (Sh(r, a), (s[c] = !0));
            }
            return (k.isArray(t) ? t.forEach(i) : i(t), this);
        }
    };
    (it.accessor([
        "Content-Type",
        "Content-Length",
        "Accept",
        "Accept-Encoding",
        "User-Agent",
        "Authorization",
    ]),
        k.reduceDescriptors(it.prototype, ({ value: e }, t) => {
            let n = t[0].toUpperCase() + t.slice(1);
            return {
                get: () => e,
                set(s) {
                    this[n] = s;
                },
            };
        }),
        k.freezeMethods(it));
    const sr = "[REDACTED ****]";
    function Ch(e) {
        if (k.hasOwnProp(e, "toJSON")) return !0;
        let t = Object.getPrototypeOf(e);
        for (; t && t !== Object.prototype; ) {
            if (k.hasOwnProp(t, "toJSON")) return !0;
            t = Object.getPrototypeOf(t);
        }
        return !1;
    }
    function Th(e, t) {
        const n = new Set(t.map((i) => String(i).toLowerCase())),
            s = [],
            r = (i) => {
                if (i === null || typeof i != "object" || k.isBuffer(i))
                    return i;
                if (s.indexOf(i) !== -1) return;
                (i instanceof it && (i = i.toJSON()), s.push(i));
                let a;
                if (k.isArray(i))
                    ((a = []),
                        i.forEach((c, u) => {
                            const h = r(c);
                            k.isUndefined(h) || (a[u] = h);
                        }));
                else {
                    if (!k.isPlainObject(i) && Ch(i)) return (s.pop(), i);
                    a = Object.create(null);
                    for (const [c, u] of Object.entries(i)) {
                        const h = n.has(c.toLowerCase()) ? sr : r(u);
                        k.isUndefined(h) || (a[c] = h);
                    }
                }
                return (s.pop(), a);
            };
        return r(e);
    }
    function lc(e) {
        try {
            return String(e);
        } catch {
            return "";
        }
    }
    function Eh(e) {
        return (
            e.errors
                .map((n) => {
                    try {
                        return n && n.message ? lc(n.message) : lc(n);
                    } catch {
                        return "";
                    }
                })
                .filter(Boolean)
                .join("; ") ||
            e.name ||
            "AggregateError"
        );
    }
    let V = class Pl extends Error {
        static from(t, n, s, r, i, a) {
            let c = t.message;
            !c && k.isArray(t.errors) && t.errors.length && (c = Eh(t));
            const u = new Pl(c, n || t.code, s, r, i);
            return (
                Object.defineProperty(u, "cause", {
                    __proto__: null,
                    value: t,
                    writable: !0,
                    enumerable: !1,
                    configurable: !0,
                }),
                (u.name = t.name),
                t.status != null && u.status == null && (u.status = t.status),
                a && Object.assign(u, a),
                u
            );
        }
        constructor(t, n, s, r, i) {
            (super(t),
                Object.defineProperty(this, "message", {
                    __proto__: null,
                    value: t,
                    enumerable: !0,
                    writable: !0,
                    configurable: !0,
                }),
                (this.name = "AxiosError"),
                (this.isAxiosError = !0),
                n && (this.code = n),
                s && (this.config = s),
                r && (this.request = r),
                i && ((this.response = i), (this.status = i.status)));
        }
        toJSON() {
            const t = this.config,
                n = t && k.hasOwnProp(t, "redact") ? t.redact : void 0,
                s = k.isArray(n) && n.length > 0 ? Th(t, n) : k.toJSONObject(t);
            return {
                message: this.message,
                name: this.name,
                description: this.description,
                number: this.number,
                fileName: this.fileName,
                lineNumber: this.lineNumber,
                columnNumber: this.columnNumber,
                stack: this.stack,
                config: s,
                code: this.code,
                status: this.status,
            };
        }
    };
    ((V.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE"),
        (V.ERR_BAD_OPTION = "ERR_BAD_OPTION"),
        (V.ECONNABORTED = "ECONNABORTED"),
        (V.ETIMEDOUT = "ETIMEDOUT"),
        (V.ECONNREFUSED = "ECONNREFUSED"),
        (V.ERR_NETWORK = "ERR_NETWORK"),
        (V.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS"),
        (V.ERR_DEPRECATED = "ERR_DEPRECATED"),
        (V.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE"),
        (V.ERR_BAD_REQUEST = "ERR_BAD_REQUEST"),
        (V.ERR_CANCELED = "ERR_CANCELED"),
        (V.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT"),
        (V.ERR_INVALID_URL = "ERR_INVALID_URL"),
        (V.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED"));
    const Ph = null,
        uc = 100;
    function gi(e) {
        return k.isPlainObject(e) || k.isArray(e);
    }
    function fc(e) {
        return k.endsWith(e, "[]") ? e.slice(0, -2) : e;
    }
    function bi(e, t, n) {
        return e
            ? e
                  .concat(t)
                  .map(function (r, i) {
                      return ((r = fc(r)), !n && i ? "[" + r + "]" : r);
                  })
                  .join(n ? "." : "")
            : t;
    }
    function Oh(e) {
        return k.isArray(e) && !e.some(gi);
    }
    const Rh = k.toFlatObject(k, {}, null, function (t) {
        return /^is[A-Z]/.test(t);
    });
    function rr(e, t, n) {
        if (!k.isObject(e)) throw new TypeError("target must be an object");
        ((t = t || new FormData()),
            (n = k.toFlatObject(
                n,
                { metaTokens: !0, dots: !1, indexes: !1 },
                !1,
                function (m, g) {
                    return !k.isUndefined(g[m]);
                },
            )));
        const s = n.metaTokens,
            r = n.visitor || O,
            i = n.dots,
            a = n.indexes,
            c = n.Blob || (typeof Blob < "u" && Blob),
            u = n.maxDepth === void 0 ? uc : n.maxDepth,
            h = c && k.isSpecCompliantForm(t),
            d = [];
        if (!k.isFunction(r)) throw new TypeError("visitor must be a function");
        function v(T) {
            if (T === null) return "";
            if (k.isDate(T)) return T.toISOString();
            if (k.isBoolean(T)) return T.toString();
            if (!h && k.isBlob(T))
                throw new V("Blob is not supported. Use a Buffer instead.");
            if (k.isArrayBuffer(T) || k.isTypedArray(T)) {
                if (h && typeof c == "function") return new c([T]);
                throw new V(
                    "Blob is not supported. Use a Buffer instead.",
                    V.ERR_NOT_SUPPORT,
                );
            }
            return T;
        }
        function w(T) {
            if (T > u)
                throw new V(
                    "Object is too deeply nested (" +
                        T +
                        " levels). Max depth: " +
                        u,
                    V.ERR_FORM_DATA_DEPTH_EXCEEDED,
                );
        }
        function C(T, m) {
            if (u === 1 / 0) return JSON.stringify(T);
            const g = [];
            return JSON.stringify(T, function (L, B) {
                if (!k.isObject(B)) return B;
                for (; g.length && g[g.length - 1] !== this; ) g.pop();
                return (g.push(B), w(m + g.length - 1), B);
            });
        }
        function O(T, m, g) {
            let b = T;
            if (k.isReactNative(t) && k.isReactNativeBlob(T))
                return (t.append(bi(g, m, i), v(T)), !1);
            if (T && !g && typeof T == "object") {
                if (k.endsWith(m, "{}"))
                    ((m = s ? m : m.slice(0, -2)), (T = C(T, 1)));
                else if (
                    (k.isArray(T) && Oh(T)) ||
                    ((k.isFileList(T) || k.endsWith(m, "[]")) &&
                        (b = k.toArray(T)))
                )
                    return (
                        (m = fc(m)),
                        b.forEach(function (B, J) {
                            !(k.isUndefined(B) || B === null) &&
                                t.append(
                                    a === !0
                                        ? bi([m], J, i)
                                        : a === null
                                          ? m
                                          : m + "[]",
                                    v(B),
                                );
                        }),
                        !1
                    );
            }
            return gi(T) ? !0 : (t.append(bi(g, m, i), v(T)), !1);
        }
        const P = Object.assign(Rh, {
            defaultVisitor: O,
            convertValue: v,
            isVisitable: gi,
        });
        function A(T, m, g = 0) {
            if (!k.isUndefined(T)) {
                if ((w(g), d.indexOf(T) !== -1))
                    throw new Error(
                        "Circular reference detected in " + m.join("."),
                    );
                (d.push(T),
                    k.forEach(T, function (L, B) {
                        (!(k.isUndefined(L) || L === null) &&
                            r.call(
                                t,
                                L,
                                k.isString(B) ? B.trim() : B,
                                m,
                                P,
                            )) === !0 && A(L, m ? m.concat(B) : [B], g + 1);
                    }),
                    d.pop());
            }
        }
        if (!k.isObject(e)) throw new TypeError("data must be an object");
        return (A(e), t);
    }
    function dc(e) {
        const t = {
            "!": "%21",
            "'": "%27",
            "(": "%28",
            ")": "%29",
            "~": "%7E",
            "%20": "+",
        };
        return encodeURIComponent(e).replace(/[!'()~]|%20/g, function (s) {
            return t[s];
        });
    }
    function yi(e, t) {
        ((this._pairs = []), e && rr(e, this, t));
    }
    const hc = yi.prototype;
    ((hc.append = function (t, n) {
        this._pairs.push([t, n]);
    }),
        (hc.toString = function (t) {
            const n = t ? (s) => t.call(this, s, dc) : dc;
            return this._pairs
                .map(function (r) {
                    return n(r[0]) + "=" + n(r[1]);
                }, "")
                .join("&");
        }));
    function Ah(e) {
        return encodeURIComponent(e)
            .replace(/%3A/gi, ":")
            .replace(/%24/g, "$")
            .replace(/%2C/gi, ",")
            .replace(/%20/g, "+");
    }
    function pc(e, t, n) {
        if (!t) return e;
        e = e || "";
        const s = k.isFunction(n) ? { serialize: n } : n,
            r = k.getSafeProp(s, "encode") || Ah,
            i = k.getSafeProp(s, "serialize");
        let a;
        if (
            (i
                ? (a = i(t, s))
                : (a = k.isURLSearchParams(t)
                      ? t.toString()
                      : new yi(t, s).toString(r)),
            a)
        ) {
            const c = e.indexOf("#");
            (c !== -1 && (e = e.slice(0, c)),
                (e += (e.indexOf("?") === -1 ? "?" : "&") + a));
        }
        return e;
    }
    class vc {
        constructor() {
            this.handlers = [];
        }
        use(t, n, s) {
            return (
                this.handlers.push({
                    fulfilled: t,
                    rejected: n,
                    synchronous: s ? s.synchronous : !1,
                    runWhen: s ? s.runWhen : null,
                }),
                this.handlers.length - 1
            );
        }
        eject(t) {
            this.handlers[t] && (this.handlers[t] = null);
        }
        clear() {
            this.handlers && (this.handlers = []);
        }
        forEach(t) {
            k.forEach(this.handlers, function (s) {
                s !== null && t(s);
            });
        }
    }
    const _i = {
            silentJSONParsing: !0,
            forcedJSONParsing: !0,
            clarifyTimeoutError: !1,
            legacyInterceptorReqResOrdering: !0,
            advertiseZstdAcceptEncoding: !1,
            validateStatusUndefinedResolves: !0,
        },
        $h = {
            isBrowser: !0,
            classes: {
                URLSearchParams:
                    typeof URLSearchParams < "u" ? URLSearchParams : yi,
                FormData: typeof FormData < "u" ? FormData : null,
                Blob: typeof Blob < "u" ? Blob : null,
            },
            protocols: ["http", "https", "file", "blob", "url", "data"],
        },
        wi = typeof window < "u" && typeof document < "u",
        xi = (typeof navigator == "object" && navigator) || void 0,
        Lh =
            wi &&
            (!xi ||
                ["ReactNative", "NativeScript", "NS"].indexOf(xi.product) < 0),
        Mh =
            typeof WorkerGlobalScope < "u" &&
            self instanceof WorkerGlobalScope &&
            typeof self.importScripts == "function",
        Nh = (wi && window.location.href) || "http://localhost",
        Ye = {
            ...Object.freeze(
                Object.defineProperty(
                    {
                        __proto__: null,
                        hasBrowserEnv: wi,
                        hasStandardBrowserEnv: Lh,
                        hasStandardBrowserWebWorkerEnv: Mh,
                        navigator: xi,
                        origin: Nh,
                    },
                    Symbol.toStringTag,
                    { value: "Module" },
                ),
            ),
            ...$h,
        };
    function Dh(e, t) {
        return rr(e, new Ye.classes.URLSearchParams(), {
            visitor: function (n, s, r, i) {
                return Ye.isNode && k.isBuffer(n)
                    ? (this.append(s, n.toString("base64")), !1)
                    : i.defaultVisitor.apply(this, arguments);
            },
            ...t,
        });
    }
    const mc = uc;
    function gc(e) {
        if (e > mc)
            throw new V(
                "FormData field is too deeply nested (" +
                    e +
                    " levels). Max depth: " +
                    mc,
                V.ERR_FORM_DATA_DEPTH_EXCEEDED,
            );
    }
    function jh(e) {
        const t = [],
            n = /[^.[\]]+|\[([^.[\]]*)]/g;
        let s;
        for (; (s = n.exec(e)) !== null; )
            (gc(t.length), t.push(s[0] === "[]" ? "" : s[1] || s[0]));
        return t;
    }
    function Ih(e) {
        const t = {},
            n = Object.keys(e);
        let s;
        const r = n.length;
        let i;
        for (s = 0; s < r; s++) ((i = n[s]), (t[i] = e[i]));
        return t;
    }
    function bc(e) {
        function t(n, s, r, i) {
            gc(i);
            let a = n[i++];
            if (a === "__proto__") return !0;
            const c = Number.isFinite(+a),
                u = i >= n.length;
            return (
                (a = !a && k.isArray(r) ? r.length : a),
                u
                    ? (k.hasOwnProp(r, a)
                          ? (r[a] = k.isArray(r[a])
                                ? r[a].concat(s)
                                : [r[a], s])
                          : (r[a] = s),
                      !c)
                    : ((!k.hasOwnProp(r, a) || !k.isObject(r[a])) &&
                          (r[a] = []),
                      t(n, s, r[a], i) && k.isArray(r[a]) && (r[a] = Ih(r[a])),
                      !c)
            );
        }
        if (k.isFormData(e) && k.isFunction(e.entries)) {
            const n = {};
            return (
                k.forEachEntry(e, (s, r) => {
                    t(jh(s), r, n, 0);
                }),
                n
            );
        }
        return null;
    }
    const Bn = (e, t) => (e != null && k.hasOwnProp(e, t) ? e[t] : void 0);
    function Uh(e, t, n) {
        if (k.isString(e))
            try {
                return ((t || JSON.parse)(e), k.trim(e));
            } catch (s) {
                if (s.name !== "SyntaxError") throw s;
            }
        return (n || JSON.stringify)(e);
    }
    const hs = {
        transitional: _i,
        adapter: ["xhr", "http", "fetch"],
        transformRequest: [
            function (t, n) {
                const s = n.getContentType() || "",
                    r = s.indexOf("application/json") > -1,
                    i = k.isObject(t);
                if (
                    (i && k.isHTMLForm(t) && (t = new FormData(t)),
                    k.isFormData(t))
                )
                    return r ? JSON.stringify(bc(t)) : t;
                if (
                    k.isArrayBuffer(t) ||
                    k.isBuffer(t) ||
                    k.isStream(t) ||
                    k.isFile(t) ||
                    k.isBlob(t) ||
                    k.isReadableStream(t)
                )
                    return t;
                if (k.isArrayBufferView(t)) return t.buffer;
                if (k.isURLSearchParams(t))
                    return (
                        n.setContentType(
                            "application/x-www-form-urlencoded;charset=utf-8",
                            !1,
                        ),
                        t.toString()
                    );
                let c;
                if (i) {
                    const u = Bn(this, "formSerializer");
                    if (s.indexOf("application/x-www-form-urlencoded") > -1)
                        return Dh(t, u).toString();
                    if (
                        (c = k.isFileList(t)) ||
                        s.indexOf("multipart/form-data") > -1
                    ) {
                        const h = Bn(this, "env"),
                            d = h && h.FormData;
                        return rr(c ? { "files[]": t } : t, d && new d(), u);
                    }
                }
                return i || r
                    ? (n.setContentType("application/json", !1), Uh(t))
                    : t;
            },
        ],
        transformResponse: [
            function (t) {
                const n = Bn(this, "transitional") || hs.transitional,
                    s = n && n.forcedJSONParsing,
                    r = Bn(this, "responseType"),
                    i = r === "json";
                if (k.isResponse(t) || k.isReadableStream(t)) return t;
                if (t && k.isString(t) && ((s && !r) || i)) {
                    const c = !(n && n.silentJSONParsing) && i;
                    try {
                        return JSON.parse(t, Bn(this, "parseReviver"));
                    } catch (u) {
                        if (c)
                            throw u.name === "SyntaxError"
                                ? V.from(
                                      u,
                                      V.ERR_BAD_RESPONSE,
                                      this,
                                      null,
                                      Bn(this, "response"),
                                  )
                                : u;
                    }
                }
                return t;
            },
        ],
        timeout: 0,
        xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: "X-XSRF-TOKEN",
        maxContentLength: -1,
        maxBodyLength: -1,
        env: { FormData: Ye.classes.FormData, Blob: Ye.classes.Blob },
        validateStatus: function (t) {
            return t >= 200 && t < 300;
        },
        headers: {
            common: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": void 0,
            },
        },
    };
    k.forEach(
        ["delete", "get", "head", "post", "put", "patch", "query"],
        (e) => {
            hs.headers[e] = {};
        },
    );
    function ki(e, t) {
        const n = this || hs,
            s = t || n,
            r = it.from(s.headers);
        let i = s.data;
        return (
            k.forEach(e, function (c) {
                i = c.call(n, i, r.normalize(), t ? t.status : void 0);
            }),
            r.normalize(),
            i
        );
    }
    function yc(e) {
        return !!(e && e.__CANCEL__);
    }
    let ps = class extends V {
        constructor(t, n, s) {
            (super(t ?? "canceled", V.ERR_CANCELED, n, s),
                (this.name = "CanceledError"),
                (this.__CANCEL__ = !0));
        }
    };
    function _c(e, t, n) {
        const s = n.config.validateStatus;
        !n.status || !s || s(n.status)
            ? e(n)
            : t(
                  new V(
                      "Request failed with status code " + n.status,
                      n.status >= 400 && n.status < 500
                          ? V.ERR_BAD_REQUEST
                          : V.ERR_BAD_RESPONSE,
                      n.config,
                      n.request,
                      n,
                  ),
              );
    }
    function Bh(e) {
        const t = /^([-+\w]{1,25}):(?:\/\/)?/.exec(e);
        return (t && t[1]) || "";
    }
    function Fh(e, t) {
        e = e || 10;
        const n = new Array(e),
            s = new Array(e);
        let r = 0,
            i = 0,
            a;
        return (
            (t = t !== void 0 ? t : 1e3),
            function (u) {
                const h = Date.now(),
                    d = s[i];
                (a || (a = h), (n[r] = u), (s[r] = h));
                let v = i,
                    w = 0;
                for (; v !== r; ) ((w += n[v++]), (v = v % e));
                if (
                    ((r = (r + 1) % e), r === i && (i = (i + 1) % e), h - a < t)
                )
                    return;
                const C = d && h - d;
                return C ? Math.round((w * 1e3) / C) : void 0;
            }
        );
    }
    function Hh(e, t) {
        let n = 0,
            s = 1e3 / t,
            r,
            i;
        const a = (h, d = Date.now()) => {
            ((n = d), (r = null), i && (clearTimeout(i), (i = null)), e(...h));
        };
        return [
            (...h) => {
                const d = Date.now(),
                    v = d - n;
                v >= s
                    ? a(h, d)
                    : ((r = h),
                      i ||
                          (i = setTimeout(() => {
                              ((i = null), a(r));
                          }, s - v)));
            },
            () => r && a(r),
        ];
    }
    const ir = (e, t, n = 3) => {
            let s = 0;
            const r = Fh(50, 250);
            return Hh((i) => {
                if (!i || typeof i.loaded != "number") return;
                const a = i.loaded,
                    c = i.lengthComputable ? i.total : void 0,
                    u = Math.max(0, c != null ? Math.min(a, c) : a),
                    h = Math.max(0, u - s),
                    d = r(h);
                s = Math.max(s, u);
                const v = {
                    loaded: u,
                    total: c,
                    progress: c ? u / c : void 0,
                    bytes: h,
                    rate: d || void 0,
                    estimated: d && c ? (c - u) / d : void 0,
                    event: i,
                    lengthComputable: c != null,
                    [t ? "download" : "upload"]: !0,
                };
                e(v);
            }, n);
        },
        wc = (e, t) => {
            const n = e != null;
            return [
                (s) => t[0]({ lengthComputable: n, total: e, loaded: s }),
                t[1],
            ];
        },
        xc =
            (e, t = k.asap) =>
            (...n) =>
                t(() => e(...n)),
        qh = Ye.hasStandardBrowserEnv
            ? ((e, t) => (n) => (
                  (n = new URL(n, Ye.origin)),
                  e.protocol === n.protocol &&
                      e.host === n.host &&
                      (t || e.port === n.port)
              ))(
                  new URL(Ye.origin),
                  Ye.navigator &&
                      /(msie|trident)/i.test(Ye.navigator.userAgent),
              )
            : () => !0,
        zh = Ye.hasStandardBrowserEnv
            ? {
                  write(e, t, n, s, r, i, a) {
                      if (typeof document > "u") return;
                      const c = [`${e}=${encodeURIComponent(t)}`];
                      (k.isNumber(n) &&
                          c.push(`expires=${new Date(n).toUTCString()}`),
                          k.isString(s) && c.push(`path=${s}`),
                          k.isString(r) && c.push(`domain=${r}`),
                          i === !0 && c.push("secure"),
                          k.isString(a) && c.push(`SameSite=${a}`),
                          (document.cookie = c.join("; ")));
                  },
                  read(e) {
                      if (typeof document > "u") return null;
                      const t = document.cookie.split(";");
                      for (let n = 0; n < t.length; n++) {
                          const s = t[n].replace(/^\s+/, ""),
                              r = s.indexOf("=");
                          if (r !== -1 && s.slice(0, r) === e)
                              try {
                                  return decodeURIComponent(s.slice(r + 1));
                              } catch {
                                  return s.slice(r + 1);
                              }
                      }
                      return null;
                  },
                  remove(e) {
                      this.write(e, "", Date.now() - 864e5, "/");
                  },
              }
            : {
                  write() {},
                  read() {
                      return null;
                  },
                  remove() {},
              };
    function Vh(e) {
        return typeof e != "string"
            ? !1
            : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
    }
    function Wh(e, t) {
        if (!t) return e;
        let n = e.length;
        for (; n > 0 && e.charCodeAt(n - 1) === 47; ) n--;
        return e.slice(0, n) + "/" + t.replace(/^\/+/, "");
    }
    const Kh = /^https?:(?!\/\/)/i,
        Jh = /[\t\n\r]/g;
    function Xh(e) {
        let t = 0;
        for (; t < e.length && e.charCodeAt(t) <= 32; ) t++;
        return e.slice(t);
    }
    function Gh(e) {
        return Xh(e).replace(Jh, "");
    }
    function Zh(e) {
        return (
            e &&
            e.replace(
                /(^|&)([^=&]*=)?[^&]+/g,
                (t, n, s = "") => `${n}${s}${sr}`,
            )
        );
    }
    function Qh(e) {
        const t = e.replace(/^(https?:\/{0,2})[^/?#]*@/i, `$1${sr}@`),
            n = t.indexOf("#"),
            r = (n === -1 ? t : t.slice(0, n)).replace(
                /([?&][^=&#]*=)[^&#]*/g,
                `$1${sr}`,
            );
        return n === -1 ? r : `${r}#${Zh(t.slice(n + 1))}`;
    }
    function kc(e, t) {
        if (typeof e == "string") {
            const n = Gh(e);
            if (Kh.test(n))
                throw new V(
                    `Invalid URL ${JSON.stringify(Qh(n))}: missing "//" after protocol`,
                    V.ERR_INVALID_URL,
                    t,
                );
        }
    }
    function Sc(e, t, n, s) {
        kc(t, s);
        let r = !Vh(t);
        return e && (r || n === !1) ? (kc(e, s), Wh(e, t)) : t;
    }
    const Cc = (e) => (e instanceof it ? { ...e } : e),
        Yh = (e) =>
            Object.getOwnPropertySymbols && Object.getOwnPropertyDescriptor
                ? Object.keys(e).concat(
                      Object.getOwnPropertySymbols(e).filter(
                          (t) =>
                              Object.getOwnPropertyDescriptor(e, t).enumerable,
                      ),
                  )
                : Object.keys(e);
    function mn(e, t) {
        ((e = e || {}), (t = t || {}));
        const n = Object.create(null);
        Object.defineProperty(n, "hasOwnProperty", {
            __proto__: null,
            value: Object.prototype.hasOwnProperty,
            enumerable: !1,
            writable: !0,
            configurable: !0,
        });
        function s(d, v, w, C) {
            return k.isPlainObject(d) && k.isPlainObject(v)
                ? k.merge.call({ caseless: C }, d, v)
                : k.isPlainObject(v)
                  ? k.merge({}, v)
                  : k.isArray(v)
                    ? v.slice()
                    : v;
        }
        function r(d, v, w, C) {
            if (k.isUndefined(v)) {
                if (!k.isUndefined(d)) return s(void 0, d, w, C);
            } else return s(d, v, w, C);
        }
        function i(d, v) {
            if (!k.isUndefined(v)) return s(void 0, v);
        }
        function a(d, v) {
            if (k.isUndefined(v)) {
                if (!k.isUndefined(d)) return s(void 0, d);
            } else return s(void 0, v);
        }
        function c(d) {
            const v = k.hasOwnProp(t, "transitional") ? t.transitional : void 0;
            if (!k.isUndefined(v))
                if (k.isPlainObject(v)) {
                    if (k.hasOwnProp(v, d)) return v[d];
                } else return;
            const w = k.hasOwnProp(e, "transitional") ? e.transitional : void 0;
            if (k.isPlainObject(w) && k.hasOwnProp(w, d)) return w[d];
        }
        function u(d, v, w) {
            if (k.hasOwnProp(t, w)) return s(d, v);
            if (k.hasOwnProp(e, w)) return s(void 0, d);
        }
        const h = {
            url: i,
            method: i,
            data: i,
            baseURL: a,
            transformRequest: a,
            transformResponse: a,
            paramsSerializer: a,
            timeout: a,
            timeoutMessage: a,
            withCredentials: a,
            withXSRFToken: a,
            adapter: a,
            responseType: a,
            xsrfCookieName: a,
            xsrfHeaderName: a,
            onUploadProgress: a,
            onDownloadProgress: a,
            decompress: a,
            maxContentLength: a,
            maxBodyLength: a,
            beforeRedirect: a,
            transport: a,
            httpAgent: a,
            httpsAgent: a,
            cancelToken: a,
            socketPath: a,
            allowedSocketPaths: a,
            responseEncoding: a,
            validateStatus: u,
            headers: (d, v, w) => r(Cc(d), Cc(v), w, !0),
        };
        return (
            k.forEach(Yh({ ...e, ...t }), function (v) {
                if (
                    v === "__proto__" ||
                    v === "constructor" ||
                    v === "prototype"
                )
                    return;
                const w = k.hasOwnProp(h, v) ? h[v] : r,
                    C = k.hasOwnProp(e, v) ? e[v] : void 0,
                    O = k.hasOwnProp(t, v) ? t[v] : void 0,
                    P = w(C, O, v);
                (k.isUndefined(P) && w !== u) || (n[v] = P);
            }),
            k.hasOwnProp(t, "validateStatus") &&
                k.isUndefined(t.validateStatus) &&
                c("validateStatusUndefinedResolves") === !1 &&
                (k.hasOwnProp(e, "validateStatus")
                    ? (n.validateStatus = s(void 0, e.validateStatus))
                    : delete n.validateStatus),
            n
        );
    }
    const ep = ["content-type", "content-length"];
    function tp(e, t, n) {
        if (n !== "content-only") {
            e.set(t);
            return;
        }
        Object.entries(t || {}).forEach(([s, r]) => {
            ep.includes(s.toLowerCase()) && e.set(s, r);
        });
    }
    const np = (e) =>
        encodeURIComponent(e).replace(/%([0-9A-F]{2})/gi, (t, n) =>
            String.fromCharCode(parseInt(n, 16)),
        );
    function Tc(e) {
        const t = mn({}, e),
            n = (w) => (k.hasOwnProp(t, w) ? t[w] : void 0),
            s = n("data");
        let r = n("withXSRFToken");
        const i = n("xsrfHeaderName"),
            a = n("xsrfCookieName");
        let c = n("headers");
        const u = n("auth"),
            h = n("baseURL"),
            d = n("allowAbsoluteUrls"),
            v = n("url");
        if (
            ((t.headers = c = it.from(c)),
            (t.url = pc(Sc(h, v, d, t), n("params"), n("paramsSerializer"))),
            u)
        ) {
            const w = k.getSafeProp(u, "username") || "",
                C = k.getSafeProp(u, "password") || "";
            try {
                c.set(
                    "Authorization",
                    "Basic " + btoa(w + ":" + (C ? np(C) : "")),
                );
            } catch (O) {
                throw V.from(O, V.ERR_BAD_OPTION_VALUE, e);
            }
        }
        if (
            (k.isFormData(s) &&
                (Ye.hasStandardBrowserEnv ||
                Ye.hasStandardBrowserWebWorkerEnv ||
                k.isReactNative(s)
                    ? c.setContentType(void 0)
                    : k.isFunction(s.getHeaders) &&
                      tp(c, s.getHeaders(), n("formDataHeaderPolicy"))),
            Ye.hasStandardBrowserEnv &&
                (k.isFunction(r) && (r = r(t)),
                r === !0 || (r == null && qh(t.url))))
        ) {
            const C = i && a && zh.read(a);
            C && c.set(i, C);
        }
        return t;
    }
    const sp =
            typeof XMLHttpRequest < "u" &&
            function (e) {
                return new Promise(function (n, s) {
                    const r = Tc(e);
                    let i = r.data;
                    const a = it.from(r.headers).normalize();
                    let {
                            responseType: c,
                            onUploadProgress: u,
                            onDownloadProgress: h,
                        } = r,
                        d,
                        v,
                        w,
                        C,
                        O;
                    function P() {
                        (C && C(),
                            O && O(),
                            r.cancelToken && r.cancelToken.unsubscribe(d),
                            r.signal &&
                                r.signal.removeEventListener("abort", d));
                    }
                    let A = new XMLHttpRequest();
                    (A.open(r.method.toUpperCase(), r.url, !0),
                        (A.timeout = r.timeout));
                    function T() {
                        if (!A) return;
                        const g = it.from(
                                "getAllResponseHeaders" in A &&
                                    A.getAllResponseHeaders(),
                            ),
                            L = {
                                data:
                                    !c || c === "text" || c === "json"
                                        ? A.responseText
                                        : A.response,
                                status: A.status,
                                statusText: A.statusText,
                                headers: g,
                                config: e,
                                request: A,
                            };
                        (_c(
                            function (J) {
                                (n(J), P());
                            },
                            function (J) {
                                (s(J), P());
                            },
                            L,
                        ),
                            (A = null));
                    }
                    ("onloadend" in A
                        ? (A.onloadend = T)
                        : (A.onreadystatechange = function () {
                              !A ||
                                  A.readyState !== 4 ||
                                  (A.status === 0 &&
                                      !(
                                          A.responseURL &&
                                          A.responseURL.startsWith("file:")
                                      )) ||
                                  setTimeout(T);
                          }),
                        (A.onabort = function () {
                            A &&
                                (s(
                                    new V(
                                        "Request aborted",
                                        V.ECONNABORTED,
                                        e,
                                        A,
                                    ),
                                ),
                                P(),
                                (A = null));
                        }),
                        (A.onerror = function (b) {
                            const L =
                                    b && b.message
                                        ? b.message
                                        : "Network Error",
                                B = new V(L, V.ERR_NETWORK, e, A);
                            ((B.event = b || null), s(B), P(), (A = null));
                        }),
                        (A.ontimeout = function () {
                            let b = r.timeout
                                ? "timeout of " + r.timeout + "ms exceeded"
                                : "timeout exceeded";
                            const L = r.transitional || _i;
                            (r.timeoutErrorMessage &&
                                (b = r.timeoutErrorMessage),
                                s(
                                    new V(
                                        b,
                                        L.clarifyTimeoutError
                                            ? V.ETIMEDOUT
                                            : V.ECONNABORTED,
                                        e,
                                        A,
                                    ),
                                ),
                                P(),
                                (A = null));
                        }),
                        i === void 0 && a.setContentType(null),
                        "setRequestHeader" in A &&
                            k.forEach(ac(a), function (b, L) {
                                A.setRequestHeader(L, b);
                            }),
                        k.isUndefined(r.withCredentials) ||
                            (A.withCredentials = !!r.withCredentials),
                        c && c !== "json" && (A.responseType = r.responseType),
                        h &&
                            (([w, O] = ir(h, !0)),
                            A.addEventListener("progress", w)),
                        u &&
                            A.upload &&
                            (([v, C] = ir(u)),
                            A.upload.addEventListener("progress", v),
                            A.upload.addEventListener("loadend", C)),
                        (r.cancelToken || r.signal) &&
                            ((d = (g) => {
                                A &&
                                    (s(!g || g.type ? new ps(null, e, A) : g),
                                    A.abort(),
                                    P(),
                                    (A = null));
                            }),
                            r.cancelToken && r.cancelToken.subscribe(d),
                            r.signal &&
                                (r.signal.aborted
                                    ? d()
                                    : r.signal.addEventListener("abort", d))));
                    const m = Bh(r.url);
                    if (m && !Ye.protocols.includes(m)) {
                        (s(
                            new V(
                                "Unsupported protocol " + m + ":",
                                V.ERR_BAD_REQUEST,
                                e,
                            ),
                        ),
                            P());
                        return;
                    }
                    A.send(i || null);
                });
            },
        rp = (e, t) => {
            if (((e = e ? e.filter(Boolean) : []), !t && !e.length)) return;
            const n = new AbortController();
            let s = !1;
            const r = function (u) {
                if (!s) {
                    ((s = !0), a());
                    const h = u instanceof Error ? u : this.reason;
                    n.abort(
                        h instanceof V
                            ? h
                            : new ps(h instanceof Error ? h.message : h),
                    );
                }
            };
            let i =
                t &&
                setTimeout(() => {
                    ((i = null),
                        r(new V(`timeout of ${t}ms exceeded`, V.ETIMEDOUT)));
                }, t);
            const a = () => {
                e &&
                    (i && clearTimeout(i),
                    (i = null),
                    e.forEach((u) => {
                        u.unsubscribe
                            ? u.unsubscribe(r)
                            : u.removeEventListener("abort", r);
                    }),
                    (e = null));
            };
            e.forEach((u) => {
                if (!s) {
                    if (u.aborted) {
                        r.call(u);
                        return;
                    }
                    u.addEventListener("abort", r, { once: !0 });
                }
            });
            const { signal: c } = n;
            return ((c.unsubscribe = () => k.asap(a)), c);
        },
        ip = function* (e, t) {
            let n = e.byteLength;
            if (n < t) {
                yield e;
                return;
            }
            let s = 0,
                r;
            for (; s < n; ) ((r = s + t), yield e.slice(s, r), (s = r));
        },
        op = async function* (e, t) {
            for await (const n of ap(e)) yield* ip(n, t);
        },
        ap = async function* (e) {
            if (e[Symbol.asyncIterator]) {
                yield* e;
                return;
            }
            const t = e.getReader();
            try {
                for (;;) {
                    const { done: n, value: s } = await t.read();
                    if (n) break;
                    yield s;
                }
            } finally {
                await t.cancel();
            }
        },
        Ec = (e, t, n, s) => {
            const r = op(e, t);
            let i = 0,
                a,
                c = (u) => {
                    a || ((a = !0), s && s(u));
                };
            return new ReadableStream(
                {
                    async pull(u) {
                        try {
                            const { done: h, value: d } = await r.next();
                            if (h) {
                                (c(), u.close());
                                return;
                            }
                            let v = d.byteLength;
                            if (n) {
                                let w = (i += v);
                                n(w);
                            }
                            u.enqueue(new Uint8Array(d));
                        } catch (h) {
                            throw (c(h), h);
                        }
                    },
                    cancel(u) {
                        return (c(u), r.return());
                    },
                },
                { highWaterMark: 2 },
            );
        },
        Pc = (e) =>
            (e >= 48 && e <= 57) ||
            (e >= 65 && e <= 70) ||
            (e >= 97 && e <= 102),
        Oc = (e, t, n) =>
            t + 2 < n && Pc(e.charCodeAt(t + 1)) && Pc(e.charCodeAt(t + 2)),
        Rc = (e) => (e <= 57 ? e - 48 : (e & 223) - 55),
        cp = (e) =>
            (e >= 65 && e <= 90) ||
            (e >= 97 && e <= 122) ||
            (e >= 48 && e <= 57) ||
            e === 43 ||
            e === 47 ||
            e === 45 ||
            e === 95,
        lp = (e) => e === 9 || e === 10 || e === 12 || e === 13 || e === 32,
        up = (e) => {
            const t = Math.floor(e / 4),
                n = e % 4;
            return t * 3 + (n === 2 ? 1 : n === 3 ? 2 : 0);
        },
        fp = (e) => {
            const t = e.length;
            let n = 0;
            return (
                t > 0 &&
                    e.charCodeAt(t - 1) === 61 &&
                    (n++, t > 1 && e.charCodeAt(t - 2) === 61 && n++),
                Math.floor(((t - n) * 3) / 4)
            );
        },
        dp = (e) => {
            const t = e.length;
            let n = 0,
                s = 0,
                r = !1;
            for (let i = 0; i < t; i++) {
                let a = e.charCodeAt(i);
                if (
                    (a === 37 &&
                        Oc(e, i, t) &&
                        ((a =
                            Rc(e.charCodeAt(i + 1)) * 16 +
                            Rc(e.charCodeAt(i + 2))),
                        (i += 2)),
                    !lp(a))
                ) {
                    if (a === 61) {
                        s++;
                        continue;
                    }
                    if (!cp(a) || s > 0) {
                        r = !0;
                        continue;
                    }
                    n++;
                }
            }
            return r || s > 2 || (s > 0 && (n + s) % 4 !== 0) || n % 4 === 1
                ? fp(e)
                : up(n);
        },
        hp = (e, t) => {
            if (!e || typeof e != "string" || !e.startsWith("data:")) return 0;
            const n = e.indexOf(",");
            if (n < 0) return 0;
            const s = e.slice(5, n),
                r = e.slice(n + 1);
            if (/;base64/i.test(s)) return t(r);
            let a = 0;
            for (let c = 0, u = r.length; c < u; c++) {
                const h = r.charCodeAt(c);
                if (h === 37 && Oc(r, c, u)) ((a += 1), (c += 2));
                else if (h < 128) a += 1;
                else if (h < 2048) a += 2;
                else if (h >= 55296 && h <= 56319 && c + 1 < u) {
                    const d = r.charCodeAt(c + 1);
                    d >= 56320 && d <= 57343 ? ((a += 4), c++) : (a += 3);
                } else a += 3;
            }
            return a;
        };
    function pp(e) {
        const t = typeof e == "string" ? e.indexOf("#") : -1;
        return hp(t === -1 ? e : e.slice(0, t), dp);
    }
    const Si = "1.19.0",
        Ac = 64 * 1024,
        { isFunction: or } = k,
        vp = (e) =>
            encodeURIComponent(e).replace(/%([0-9A-F]{2})/gi, (t, n) =>
                String.fromCharCode(parseInt(n, 16)),
            ),
        $c = (e) => {
            if (!k.isString(e)) return e;
            try {
                return decodeURIComponent(e);
            } catch {
                return e;
            }
        },
        Lc = (e, ...t) => {
            try {
                return !!e(...t);
            } catch {
                return !1;
            }
        },
        mp = (e) => {
            const t = e.indexOf("://");
            let n = e;
            return (
                t !== -1 && (n = n.slice(t + 3)),
                n.includes("@") || n.includes(":")
            );
        },
        gp = (e) => {
            const t =
                    k.global !== void 0 && k.global !== null
                        ? k.global
                        : globalThis,
                { ReadableStream: n, TextEncoder: s } = t;
            e = k.merge.call(
                { skipUndefined: !0 },
                { Request: t.Request, Response: t.Response },
                e,
            );
            const { fetch: r, Request: i, Response: a } = e,
                c = r ? or(r) : typeof fetch == "function",
                u = or(i),
                h = or(a);
            if (!c) return !1;
            const d = c && or(n),
                v =
                    c &&
                    (typeof s == "function"
                        ? (
                              (T) => (m) =>
                                  T.encode(m)
                          )(new s())
                        : async (T) =>
                              new Uint8Array(await new i(T).arrayBuffer())),
                w =
                    u &&
                    d &&
                    Lc(() => {
                        let T = !1;
                        const m = new i(Ye.origin, {
                                body: new n(),
                                method: "POST",
                                get duplex() {
                                    return ((T = !0), "half");
                                },
                            }),
                            g = m.headers.has("Content-Type");
                        return (m.body != null && m.body.cancel(), T && !g);
                    }),
                C = h && d && Lc(() => k.isReadableStream(new a("").body)),
                O = { stream: C && ((T) => T.body) };
            c &&
                ["text", "arrayBuffer", "blob", "formData", "stream"].forEach(
                    (T) => {
                        !O[T] &&
                            (O[T] = (m, g) => {
                                let b = m && m[T];
                                if (b) return b.call(m);
                                throw new V(
                                    `Response type '${T}' is not supported`,
                                    V.ERR_NOT_SUPPORT,
                                    g,
                                );
                            });
                    },
                );
            const P = async (T) => {
                    if (T == null) return 0;
                    if (k.isBlob(T)) return T.size;
                    if (k.isSpecCompliantForm(T))
                        return (
                            await new i(Ye.origin, {
                                method: "POST",
                                body: T,
                            }).arrayBuffer()
                        ).byteLength;
                    if (k.isArrayBufferView(T) || k.isArrayBuffer(T))
                        return T.byteLength;
                    if ((k.isURLSearchParams(T) && (T = T + ""), k.isString(T)))
                        return (await v(T)).byteLength;
                },
                A = async (T, m) => {
                    const g = k.toFiniteNumber(T.getContentLength());
                    return g ?? P(m);
                };
            return async (T) => {
                let {
                    url: m,
                    method: g,
                    data: b,
                    signal: L,
                    cancelToken: B,
                    timeout: J,
                    onDownloadProgress: oe,
                    onUploadProgress: ie,
                    responseType: z,
                    headers: Z,
                    withCredentials: Q = "same-origin",
                    fetchOptions: K,
                    maxContentLength: ne,
                    maxBodyLength: et,
                } = Tc(T);
                const Oe = k.isNumber(ne) && ne > -1,
                    _e = k.isNumber(et) && et > -1,
                    Se = (le) => (k.hasOwnProp(T, le) ? T[le] : void 0);
                let se = r || fetch;
                z = z ? (z + "").toLowerCase() : "text";
                let ae = rp([L, B && B.toAbortSignal()], J),
                    fe = null;
                const Ne =
                    ae &&
                    ae.unsubscribe &&
                    (() => {
                        ae.unsubscribe();
                    });
                let ft,
                    wt = null;
                const Re = () =>
                    new V(
                        "Request body larger than maxBodyLength limit",
                        V.ERR_BAD_REQUEST,
                        T,
                        fe,
                    );
                try {
                    let le;
                    const ze = Se("auth");
                    if (ze) {
                        const R = k.getSafeProp(ze, "username") || "",
                            D = k.getSafeProp(ze, "password") || "";
                        le = { username: R, password: D };
                    }
                    if (mp(m)) {
                        const R = new URL(m, Ye.origin);
                        if (!le && (R.username || R.password)) {
                            const D = $c(R.username),
                                H = $c(R.password);
                            le = { username: D, password: H };
                        }
                        (R.username || R.password) &&
                            ((R.username = ""),
                            (R.password = ""),
                            (m = R.href));
                    }
                    if (
                        (le &&
                            (Z.delete("authorization"),
                            Z.set(
                                "Authorization",
                                "Basic " +
                                    btoa(
                                        vp(
                                            (le.username || "") +
                                                ":" +
                                                (le.password || ""),
                                        ),
                                    ),
                            )),
                        Oe &&
                            typeof m == "string" &&
                            m.startsWith("data:") &&
                            pp(m) > ne)
                    )
                        throw new V(
                            "maxContentLength size of " + ne + " exceeded",
                            V.ERR_BAD_RESPONSE,
                            T,
                            fe,
                        );
                    if (_e && g !== "get" && g !== "head") {
                        const R = await P(b);
                        if (
                            typeof R == "number" &&
                            isFinite(R) &&
                            ((ft = R), R > et)
                        )
                            throw Re();
                    }
                    const Ft = _e && (k.isReadableStream(b) || k.isStream(b)),
                        Fe = (R, D, H) =>
                            Ec(
                                R,
                                Ac,
                                (U) => {
                                    if (_e && U > et) throw (wt = Re());
                                    D && D(U);
                                },
                                H,
                            );
                    if (w && g !== "get" && g !== "head" && (ie || Ft)) {
                        if (((ft = ft ?? (await A(Z, b))), ft !== 0 || Ft)) {
                            let R = new i(m, {
                                    method: "POST",
                                    body: b,
                                    duplex: "half",
                                }),
                                D;
                            if (
                                (k.isFormData(b) &&
                                    (D = R.headers.get("content-type")) &&
                                    Z.setContentType(D),
                                R.body)
                            ) {
                                const [H, U] = (ie && wc(ft, ir(xc(ie)))) || [];
                                b = Fe(R.body, H, U);
                            }
                        }
                    } else if (Ft && !u && d && g !== "get" && g !== "head")
                        b = Fe(b);
                    else if (Ft && u && !w && g !== "get" && g !== "head")
                        throw new V(
                            "Stream request bodies are not supported by the current fetch implementation",
                            V.ERR_NOT_SUPPORT,
                            T,
                            fe,
                        );
                    k.isString(Q) || (Q = Q ? "include" : "omit");
                    const He = u && "credentials" in i.prototype;
                    if (k.isFormData(b)) {
                        const R = Z.getContentType();
                        R &&
                            /^multipart\/form-data/i.test(R) &&
                            !/boundary=/i.test(R) &&
                            Z.delete("content-type");
                    }
                    Z.set("User-Agent", "axios/" + Si, !1);
                    const ys = {
                        ...K,
                        signal: ae,
                        method: g.toUpperCase(),
                        headers: ac(Z.normalize()),
                        body: b,
                        duplex: "half",
                        credentials: He ? Q : void 0,
                    };
                    fe = u && new i(m, ys);
                    let y = await (u ? se(fe, K) : se(m, ys));
                    const x = it.from(y.headers);
                    if (Oe) {
                        const R = k.toFiniteNumber(x.getContentLength());
                        if (R != null && R > ne)
                            throw new V(
                                "maxContentLength size of " + ne + " exceeded",
                                V.ERR_BAD_RESPONSE,
                                T,
                                fe,
                            );
                    }
                    const M = C && (z === "stream" || z === "response");
                    if (C && y.body && (oe || Oe || (M && Ne))) {
                        const R = {};
                        ["status", "statusText", "headers"].forEach((te) => {
                            R[te] = y[te];
                        });
                        const D = k.toFiniteNumber(x.getContentLength()),
                            [H, U] = (oe && wc(D, ir(xc(oe), !0))) || [];
                        let F = 0;
                        const I = (te) => {
                            if (Oe && ((F = te), F > ne))
                                throw new V(
                                    "maxContentLength size of " +
                                        ne +
                                        " exceeded",
                                    V.ERR_BAD_RESPONSE,
                                    T,
                                    fe,
                                );
                            H && H(te);
                        };
                        y = new a(
                            Ec(y.body, Ac, I, () => {
                                (U && U(), Ne && Ne());
                            }),
                            R,
                        );
                    }
                    z = z || "text";
                    let j = await O[k.findKey(O, z) || "text"](y, T);
                    if (Oe && !C && !M) {
                        let R;
                        if (
                            (j != null &&
                                (typeof j.byteLength == "number"
                                    ? (R = j.byteLength)
                                    : typeof j.size == "number"
                                      ? (R = j.size)
                                      : typeof j == "string" &&
                                        (R =
                                            typeof s == "function"
                                                ? new s().encode(j).byteLength
                                                : j.length)),
                            typeof R == "number" && R > ne)
                        )
                            throw new V(
                                "maxContentLength size of " + ne + " exceeded",
                                V.ERR_BAD_RESPONSE,
                                T,
                                fe,
                            );
                    }
                    return (
                        !M && Ne && Ne(),
                        await new Promise((R, D) => {
                            _c(R, D, {
                                data: j,
                                headers: it.from(y.headers),
                                status: y.status,
                                statusText: y.statusText,
                                config: T,
                                request: fe,
                            });
                        })
                    );
                } catch (le) {
                    if (
                        (Ne && Ne(), ae && ae.aborted && ae.reason instanceof V)
                    ) {
                        const ze = ae.reason;
                        throw (
                            (ze.config = T),
                            fe && (ze.request = fe),
                            le !== ze &&
                                Object.defineProperty(ze, "cause", {
                                    __proto__: null,
                                    value: le,
                                    writable: !0,
                                    enumerable: !1,
                                    configurable: !0,
                                }),
                            ze
                        );
                    }
                    if (wt) throw (fe && !wt.request && (wt.request = fe), wt);
                    if (le instanceof V)
                        throw (fe && !le.request && (le.request = fe), le);
                    if (
                        le &&
                        le.name === "TypeError" &&
                        /Load failed|fetch/i.test(le.message)
                    ) {
                        const ze = new V(
                            "Network Error",
                            V.ERR_NETWORK,
                            T,
                            fe,
                            le && le.response,
                        );
                        throw (
                            Object.defineProperty(ze, "cause", {
                                __proto__: null,
                                value: le.cause || le,
                                writable: !0,
                                enumerable: !1,
                                configurable: !0,
                            }),
                            ze
                        );
                    }
                    throw V.from(le, le && le.code, T, fe, le && le.response);
                }
            };
        },
        bp = new Map(),
        Mc = (e) => {
            let t = (e && e.env) || {};
            const { fetch: n, Request: s, Response: r } = t,
                i = [s, r, n];
            let a = i.length,
                c = a,
                u,
                h,
                d = bp;
            for (; c--; )
                ((u = i[c]),
                    (h = d.get(u)),
                    h === void 0 && d.set(u, (h = c ? new Map() : gp(t))),
                    (d = h));
            return h;
        };
    Mc();
    const Ci = { http: Ph, xhr: sp, fetch: { get: Mc } };
    k.forEach(Ci, (e, t) => {
        if (e) {
            try {
                Object.defineProperty(e, "name", { __proto__: null, value: t });
            } catch {}
            Object.defineProperty(e, "adapterName", {
                __proto__: null,
                value: t,
            });
        }
    });
    const Nc = (e) => `- ${e}`,
        yp = (e) => k.isFunction(e) || e === null || e === !1;
    function _p(e, t) {
        e = k.isArray(e) ? e : [e];
        const { length: n } = e;
        let s, r;
        const i = {};
        for (let a = 0; a < n; a++) {
            s = e[a];
            let c;
            if (
                ((r = s),
                !yp(s) &&
                    ((r = Ci[(c = String(s)).toLowerCase()]), r === void 0))
            )
                throw new V(`Unknown adapter '${c}'`);
            if (r && (k.isFunction(r) || (r = r.get(t)))) break;
            i[c || "#" + a] = r;
        }
        if (!r) {
            const a = Object.entries(i).map(
                ([u, h]) =>
                    `adapter ${u} ` +
                    (h === !1
                        ? "is not supported by the environment"
                        : "is not available in the build"),
            );
            let c = n
                ? a.length > 1
                    ? `since :
` +
                      a.map(Nc).join(`
`)
                    : " " + Nc(a[0])
                : "as no adapter specified";
            throw new V(
                "There is no suitable adapter to dispatch the request " + c,
                V.ERR_NOT_SUPPORT,
            );
        }
        return r;
    }
    const Dc = { getAdapter: _p, adapters: Ci };
    function Ti(e) {
        if (
            (e.cancelToken && e.cancelToken.throwIfRequested(),
            e.signal && e.signal.aborted)
        )
            throw new ps(null, e);
    }
    function Ei(e) {
        return (
            Ti(e),
            (e.headers = it.from(e.headers)),
            (e.data = ki.call(e, e.transformRequest)),
            ["post", "put", "patch"].indexOf(e.method) !== -1 &&
                e.headers.setContentType(
                    "application/x-www-form-urlencoded",
                    !1,
                ),
            Dc.getAdapter(
                e.adapter || hs.adapter,
                e,
            )(e).then(
                function (s) {
                    (Ti(e), (e.response = s));
                    try {
                        s.data = ki.call(e, e.transformResponse, s);
                    } finally {
                        delete e.response;
                    }
                    return ((s.headers = it.from(s.headers)), s);
                },
                function (s) {
                    if (!yc(s) && (Ti(e), s && s.response)) {
                        e.response = s.response;
                        try {
                            s.response.data = ki.call(
                                e,
                                e.transformResponse,
                                s.response,
                            );
                        } finally {
                            delete e.response;
                        }
                        s.response.headers = it.from(s.response.headers);
                    }
                    return Promise.reject(s);
                },
            )
        );
    }
    const ar = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach(
        (e, t) => {
            ar[e] = function (s) {
                return typeof s === e || "a" + (t < 1 ? "n " : " ") + e;
            };
        },
    );
    const jc = {};
    ((ar.transitional = function (t, n, s) {
        function r(i, a) {
            return (
                "[Axios v" +
                Si +
                "] Transitional option '" +
                i +
                "'" +
                a +
                (s ? ". " + s : "")
            );
        }
        return (i, a, c) => {
            if (t === !1)
                throw new V(
                    r(a, " has been removed" + (n ? " in " + n : "")),
                    V.ERR_DEPRECATED,
                );
            return (
                n &&
                    !jc[a] &&
                    ((jc[a] = !0),
                    console.warn(
                        r(
                            a,
                            " has been deprecated since v" +
                                n +
                                " and will be removed in the near future",
                        ),
                    )),
                t ? t(i, a, c) : !0
            );
        };
    }),
        (ar.spelling = function (t) {
            return (n, s) => (
                console.warn(`${s} is likely a misspelling of ${t}`),
                !0
            );
        }));
    function wp(e, t, n) {
        if (typeof e != "object" || e === null)
            throw new V("options must be an object", V.ERR_BAD_OPTION_VALUE);
        const s = Object.keys(e);
        let r = s.length;
        for (; r-- > 0; ) {
            const i = s[r],
                a = Object.prototype.hasOwnProperty.call(t, i) ? t[i] : void 0;
            if (a) {
                const c = e[i],
                    u = c === void 0 || a(c, i, e);
                if (u !== !0)
                    throw new V(
                        "option " + i + " must be " + u,
                        V.ERR_BAD_OPTION_VALUE,
                    );
                continue;
            }
            if (n !== !0) throw new V("Unknown option " + i, V.ERR_BAD_OPTION);
        }
    }
    const cr = { assertOptions: wp, validators: ar },
        ot = cr.validators;
    let gn = class {
        constructor(t) {
            ((this.defaults = t || {}),
                (this.interceptors = {
                    request: new vc(),
                    response: new vc(),
                }));
        }
        async request(t, n) {
            try {
                return await this._request(t, n);
            } catch (s) {
                if (s instanceof Error) {
                    let r = {};
                    Error.captureStackTrace
                        ? Error.captureStackTrace(r)
                        : (r = new Error());
                    const i = (() => {
                        if (!r.stack) return "";
                        const a = r.stack.indexOf(`
`);
                        return a === -1 ? "" : r.stack.slice(a + 1);
                    })();
                    try {
                        if (!s.stack) s.stack = i;
                        else if (i) {
                            const a = i.indexOf(`
`),
                                c =
                                    a === -1
                                        ? -1
                                        : i.indexOf(
                                              `
`,
                                              a + 1,
                                          ),
                                u = c === -1 ? "" : i.slice(c + 1);
                            String(s.stack).endsWith(u) ||
                                (s.stack +=
                                    `
` + i);
                        }
                    } catch {}
                }
                throw s;
            }
        }
        _request(t, n) {
            (typeof t == "string"
                ? ((n = n || {}), (n.url = t))
                : (n = t || {}),
                (n = mn(this.defaults, n)));
            const { transitional: s, paramsSerializer: r, headers: i } = n;
            (s !== void 0 &&
                cr.assertOptions(
                    s,
                    {
                        silentJSONParsing: ot.transitional(ot.boolean),
                        forcedJSONParsing: ot.transitional(ot.boolean),
                        clarifyTimeoutError: ot.transitional(ot.boolean),
                        legacyInterceptorReqResOrdering: ot.transitional(
                            ot.boolean,
                        ),
                        advertiseZstdAcceptEncoding: ot.transitional(
                            ot.boolean,
                        ),
                        validateStatusUndefinedResolves: ot.transitional(
                            ot.boolean,
                        ),
                    },
                    !1,
                ),
                r != null &&
                    (k.isFunction(r)
                        ? (n.paramsSerializer = { serialize: r })
                        : cr.assertOptions(
                              r,
                              { encode: ot.function, serialize: ot.function },
                              !0,
                          )),
                n.allowAbsoluteUrls !== void 0 ||
                    (this.defaults.allowAbsoluteUrls !== void 0
                        ? (n.allowAbsoluteUrls =
                              this.defaults.allowAbsoluteUrls)
                        : (n.allowAbsoluteUrls = !0)),
                cr.assertOptions(
                    n,
                    {
                        baseUrl: ot.spelling("baseURL"),
                        withXsrfToken: ot.spelling("withXSRFToken"),
                    },
                    !0,
                ),
                (n.method = (
                    n.method ||
                    this.defaults.method ||
                    "get"
                ).toLowerCase()));
            let a = i && k.merge(i.common, i[n.method]);
            (i &&
                k.forEach(
                    [
                        "delete",
                        "get",
                        "head",
                        "post",
                        "put",
                        "patch",
                        "query",
                        "common",
                    ],
                    (O) => {
                        delete i[O];
                    },
                ),
                (n.headers = it.concat(a, i)));
            const c = [];
            let u = !0;
            this.interceptors.request.forEach(function (P) {
                if (typeof P.runWhen == "function" && P.runWhen(n) === !1)
                    return;
                u = u && P.synchronous;
                const A = n.transitional || _i;
                A && A.legacyInterceptorReqResOrdering
                    ? c.unshift(P.fulfilled, P.rejected)
                    : c.push(P.fulfilled, P.rejected);
            });
            const h = [];
            this.interceptors.response.forEach(function (P) {
                h.push(P.fulfilled, P.rejected);
            });
            let d,
                v = 0,
                w;
            if (!u) {
                const O = [Ei.bind(this), void 0];
                for (
                    O.unshift(...c),
                        O.push(...h),
                        w = O.length,
                        d = Promise.resolve(n);
                    v < w;
                )
                    d = d.then(O[v++], O[v++]);
                return d;
            }
            w = c.length;
            let C = n;
            for (; v < w; ) {
                const O = c[v++],
                    P = c[v++];
                try {
                    C = O ? O(C) : C;
                } catch (A) {
                    if (!P) {
                        d = Promise.reject(A);
                        break;
                    }
                    try {
                        const T = P.call(this, A);
                        k.isThenable(T) &&
                            (d = Promise.resolve(T).then(() =>
                                Ei.call(this, C),
                            ));
                    } catch (T) {
                        d = Promise.reject(T);
                    }
                    break;
                }
            }
            if (!d)
                try {
                    d = Ei.call(this, C);
                } catch (O) {
                    d = Promise.reject(O);
                }
            for (v = 0, w = h.length; v < w; ) d = d.then(h[v++], h[v++]);
            return d;
        }
        getUri(t) {
            t = mn(this.defaults, t);
            const n = Sc(t.baseURL, t.url, t.allowAbsoluteUrls, t);
            return pc(n, t.params, t.paramsSerializer);
        }
    };
    (k.forEach(["delete", "get", "head", "options"], function (t) {
        gn.prototype[t] = function (n, s) {
            return this.request(
                mn(s || {}, {
                    method: t,
                    url: n,
                    data: s && k.hasOwnProp(s, "data") ? s.data : void 0,
                }),
            );
        };
    }),
        k.forEach(["post", "put", "patch", "query"], function (t) {
            function n(s) {
                return function (i, a, c) {
                    return this.request(
                        mn(c || {}, {
                            method: t,
                            headers: s
                                ? { "Content-Type": "multipart/form-data" }
                                : {},
                            url: i,
                            data: a,
                        }),
                    );
                };
            }
            ((gn.prototype[t] = n()),
                t !== "query" && (gn.prototype[t + "Form"] = n(!0)));
        }));
    let xp = class Ol {
        constructor(t) {
            if (typeof t != "function")
                throw new TypeError("executor must be a function.");
            let n;
            this.promise = new Promise(function (i) {
                n = i;
            });
            const s = this;
            (this.promise.then((r) => {
                if (!s._listeners) return;
                let i = s._listeners.length;
                for (; i-- > 0; ) s._listeners[i](r);
                s._listeners = null;
            }),
                (this.promise.then = (r) => {
                    let i;
                    const a = new Promise((c) => {
                        (s.subscribe(c), (i = c));
                    }).then(r);
                    return (
                        (a.cancel = function () {
                            s.unsubscribe(i);
                        }),
                        a
                    );
                }),
                t(function (i, a, c) {
                    s.reason || ((s.reason = new ps(i, a, c)), n(s.reason));
                }));
        }
        throwIfRequested() {
            if (this.reason) throw this.reason;
        }
        subscribe(t) {
            if (this.reason) {
                t(this.reason);
                return;
            }
            this._listeners ? this._listeners.push(t) : (this._listeners = [t]);
        }
        unsubscribe(t) {
            if (!this._listeners) return;
            const n = this._listeners.indexOf(t);
            n !== -1 && this._listeners.splice(n, 1);
        }
        toAbortSignal() {
            const t = new AbortController(),
                n = (s) => {
                    t.abort(s);
                };
            return (
                this.subscribe(n),
                (t.signal.unsubscribe = () => this.unsubscribe(n)),
                t.signal
            );
        }
        static source() {
            let t;
            return {
                token: new Ol(function (r) {
                    t = r;
                }),
                cancel: t,
            };
        }
    };
    function kp(e) {
        return function (n) {
            return e.apply(null, n);
        };
    }
    function Sp(e) {
        return k.isObject(e) && e.isAxiosError === !0;
    }
    const Pi = {
        Continue: 100,
        SwitchingProtocols: 101,
        Processing: 102,
        EarlyHints: 103,
        Ok: 200,
        Created: 201,
        Accepted: 202,
        NonAuthoritativeInformation: 203,
        NoContent: 204,
        ResetContent: 205,
        PartialContent: 206,
        MultiStatus: 207,
        AlreadyReported: 208,
        ImUsed: 226,
        MultipleChoices: 300,
        MovedPermanently: 301,
        Found: 302,
        SeeOther: 303,
        NotModified: 304,
        UseProxy: 305,
        Unused: 306,
        TemporaryRedirect: 307,
        PermanentRedirect: 308,
        BadRequest: 400,
        Unauthorized: 401,
        PaymentRequired: 402,
        Forbidden: 403,
        NotFound: 404,
        MethodNotAllowed: 405,
        NotAcceptable: 406,
        ProxyAuthenticationRequired: 407,
        RequestTimeout: 408,
        Conflict: 409,
        Gone: 410,
        LengthRequired: 411,
        PreconditionFailed: 412,
        PayloadTooLarge: 413,
        UriTooLong: 414,
        UnsupportedMediaType: 415,
        RangeNotSatisfiable: 416,
        ExpectationFailed: 417,
        ImATeapot: 418,
        MisdirectedRequest: 421,
        UnprocessableEntity: 422,
        Locked: 423,
        FailedDependency: 424,
        TooEarly: 425,
        UpgradeRequired: 426,
        PreconditionRequired: 428,
        TooManyRequests: 429,
        RequestHeaderFieldsTooLarge: 431,
        UnavailableForLegalReasons: 451,
        InternalServerError: 500,
        NotImplemented: 501,
        BadGateway: 502,
        ServiceUnavailable: 503,
        GatewayTimeout: 504,
        HttpVersionNotSupported: 505,
        VariantAlsoNegotiates: 506,
        InsufficientStorage: 507,
        LoopDetected: 508,
        NotExtended: 510,
        NetworkAuthenticationRequired: 511,
        WebServerReturnsAnUnknownError: 520,
        WebServerIsDown: 521,
        ConnectionTimedOut: 522,
        OriginIsUnreachable: 523,
        TimeoutOccurred: 524,
        SslHandshakeFailed: 525,
        InvalidSslCertificate: 526,
    };
    Object.entries(Pi).forEach(([e, t]) => {
        Pi[t] = e;
    });
    function Ic(e) {
        const t = new gn(e),
            n = Ga(gn.prototype.request, t);
        return (
            k.extend(n, gn.prototype, t, { allOwnKeys: !0 }),
            k.extend(n, t, null, { allOwnKeys: !0 }),
            (n.create = function (r) {
                return Ic(mn(e, r));
            }),
            n
        );
    }
    const qe = Ic(hs);
    ((qe.Axios = gn),
        (qe.CanceledError = ps),
        (qe.CancelToken = xp),
        (qe.isCancel = yc),
        (qe.VERSION = Si),
        (qe.toFormData = rr),
        (qe.AxiosError = V),
        (qe.Cancel = qe.CanceledError),
        (qe.all = function (t) {
            return Promise.all(t);
        }),
        (qe.spread = kp),
        (qe.isAxiosError = Sp),
        (qe.mergeConfig = mn),
        (qe.AxiosHeaders = it),
        (qe.formToJSON = (e) => bc(k.isHTMLForm(e) ? new FormData(e) : e)),
        (qe.getAdapter = Dc.getAdapter),
        (qe.HttpStatusCode = Pi),
        (qe.default = qe));
    const {
        Axios: M_,
        AxiosError: N_,
        CanceledError: D_,
        isCancel: j_,
        CancelToken: I_,
        VERSION: U_,
        all: B_,
        Cancel: F_,
        isAxiosError: H_,
        spread: q_,
        toFormData: z_,
        AxiosHeaders: V_,
        HttpStatusCode: W_,
        formToJSON: K_,
        getAdapter: J_,
        mergeConfig: X_,
        create: G_,
    } = qe;
    let lr = null;
    function Ot() {
        if (lr) return lr;
        const e = window.ConverseConfig ?? {};
        return (
            (lr = qe.create({
                baseURL: e.apiBaseUrl ?? "/api/chat",
                withCredentials: !0,
                withXSRFToken: !0,
                headers: { Accept: "application/json" },
            })),
            lr
        );
    }
    function tn() {
        const e = Ot(),
            t = Be();
        async function n(i, a = null) {
            const c = { ...(i ? { q: i } : {}), ...(a ? { type: a } : {}) },
                { data: u } = await e.get("/users", { params: c });
            return (Zs(u.data), u.data);
        }
        async function s(i) {
            const a = i.filter((c) => !t.usersById[ut(c.type, c.id)]);
            if (a.length > 0) {
                const c = a.reduce((u, h) => {
                    var d;
                    return ((u[(d = h.type)] ?? (u[d] = [])).push(h.id), u);
                }, {});
                await Promise.all(
                    Object.entries(c).map(async ([u, h]) => {
                        const { data: d } = await e.get("/users", {
                            params: { type: u, ids: h },
                        });
                        Zs(d.data);
                    }),
                );
            }
            return i.map((c) => r(c));
        }
        function r(i) {
            if (!i)
                return {
                    type: null,
                    id: null,
                    name: "Unknown",
                    avatar_url: null,
                };
            const a = typeof i == "string" ? i : ut(i.type, i.id);
            return (
                t.usersById[a] ?? {
                    type: i.type ?? null,
                    id: i.id ?? null,
                    name: "Unknown",
                    avatar_url: null,
                }
            );
        }
        return { search: n, resolve: s, get: r };
    }
    function bt() {
        const e = Ot(),
            t = Be();
        async function n(O = {}) {
            const { data: P } = await e.get("/conversations", { params: O });
            return ((t.conversations = P.data), t.conversations);
        }
        async function s(O) {
            const { data: P } = await e.get(`/conversations/${O}`);
            return (Bt(P.data), P.data);
        }
        async function r(O) {
            const { data: P } = await e.post("/conversations", {
                type: "private",
                participants: [{ type: O.type, id: O.id }],
            });
            return (Bt(P.data), P.data);
        }
        async function i(O, P, A) {
            const { data: T } = await e.post("/conversations", {
                type: "group",
                name: O,
                description: P,
                participants: A.map((m) => ({ type: m.type, id: m.id })),
            });
            return (Bt(T.data), T.data);
        }
        async function a(O, P) {
            const { data: A } = await e.patch(`/conversations/${O}/mute`, {
                muted_until: P,
            });
            Bt(A.data);
        }
        async function c(O, P) {
            const { data: A } = await e.patch(`/conversations/${O}/archive`, {
                archived: P,
            });
            Bt(A.data);
        }
        async function u(O, P) {
            const { data: A } = await e.patch(`/conversations/${O}/pin`, {
                pinned: P,
            });
            Bt(A.data);
        }
        async function h(O, P) {
            const { data: A } = await e.patch(`/conversations/${O}/hide`, {
                hidden: P,
            });
            P ? Ha(O) : Bt(A.data);
        }
        async function d(O, P) {
            const { data: A } = await e.patch(`/conversations/${O}/wallpaper`, {
                wallpaper: P,
            });
            Bt(A.data);
        }
        async function v(O) {
            (await e.post(`/conversations/${O}/leave`), Ha(O));
        }
        async function w(O, P) {
            const { data: A } = await e.patch(
                `/conversations/${O}/disappearing`,
                { ttl_seconds: P },
            );
            Bt(A.data);
        }
        function C(O) {
            t.activeConversationId = O;
        }
        return {
            refresh: n,
            refreshOne: s,
            createPrivate: r,
            createGroup: i,
            mute: a,
            setArchived: c,
            setPinned: u,
            setHidden: h,
            setWallpaper: d,
            leave: v,
            setDisappearing: w,
            setActive: C,
        };
    }
    const Cp = {
            class: "cv-conversation-item__body min-w-0 flex-1 border-b border-converse-border pb-2.5",
        },
        Tp = {
            class: "cv-conversation-item__title-row flex items-center justify-between gap-2",
        },
        Ep = { class: "truncate text-[15px] text-converse-text" },
        Pp = { key: 0, class: "shrink-0 text-xs text-converse-textMuted" },
        Op = {
            class: "cv-conversation-item__preview-row flex items-center justify-between gap-2",
        },
        Rp = {
            class: "flex min-w-0 items-center truncate text-sm text-converse-textMuted",
        },
        Ap = { class: "truncate" },
        $p = {
            class: "cv-conversation-item__badges flex shrink-0 items-center gap-1",
        },
        Lp = { key: 0, class: "text-converse-textMuted", title: "Muted" },
        Mp = {
            key: 1,
            class: "cv-conversation-item__unread flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-converse-accent px-1.5 text-xs font-medium text-converse-accentContrast",
        },
        Np = { key: 2, class: "text-converse-textMuted", title: "Pinned" },
        Dp = {
            class: "cv-conversation-item__menu-wrap opacity-0 group-hover:opacity-100 focus-within:opacity-100",
        },
        jp = {
            __name: "ConversationListItem",
            props: {
                conversation: { type: Object, required: !0 },
                active: { type: Boolean, default: !1 },
            },
            emits: ["select"],
            setup(e) {
                const t = e,
                    n = Be(),
                    { resolve: s, get: r } = tn(),
                    { mute: i, setPinned: a, setHidden: c, leave: u } = bt(),
                    h = ve(() => {
                        var b;
                        return !!(
                            t.conversation.pinned_at ||
                            ((b = t.conversation.me) != null && b.pinned_at)
                        );
                    }),
                    d = ve(() => {
                        var b;
                        return !!(
                            (b = t.conversation.me) != null && b.muted_until
                        );
                    }),
                    v = ve(() => t.conversation.type === "group");
                function w(b) {
                    switch (b) {
                        case "mute":
                            return i(
                                t.conversation.id,
                                new Date(
                                    Date.now() + 1e3 * 60 * 60 * 24 * 365,
                                ).toISOString(),
                            );
                        case "unmute":
                            return i(t.conversation.id, null);
                        case "pin":
                            return a(t.conversation.id, !0);
                        case "unpin":
                            return a(t.conversation.id, !1);
                        case "delete":
                            return c(t.conversation.id, !0);
                        case "leave":
                            return u(t.conversation.id);
                        default:
                            return null;
                    }
                }
                const C = ve(() => {
                    if (t.conversation.type !== "private") return null;
                    const b = (t.conversation.participants ?? []).find(
                        (L) => Yt(L) !== n.currentKey,
                    );
                    return b
                        ? { type: b.chatable_type, id: b.chatable_id }
                        : null;
                });
                async function O() {
                    C.value && (await s([C.value]));
                }
                (jt(O), Qe(C, O));
                const P = ve(() =>
                        t.conversation.type === "group"
                            ? t.conversation.name || "Group"
                            : C.value
                              ? r(C.value).name
                              : "Unknown",
                    ),
                    A = ve(() =>
                        t.conversation.avatar_url
                            ? t.conversation.avatar_url
                            : C.value
                              ? r(C.value).avatar_url
                              : null,
                    ),
                    T = ve(() => {
                        const b = t.conversation.last_message;
                        return b
                            ? b.deleted_for_everyone
                                ? "This message was deleted"
                                : b.type !== "text"
                                  ? `[${b.type}]`
                                  : (b.body ?? "")
                            : "";
                    }),
                    m = ve(() => {
                        const b = t.conversation.last_message;
                        return !!b && Yt(b) === n.currentKey;
                    }),
                    g = ve(() => {
                        var ie;
                        const b =
                            ((ie = t.conversation.last_message) == null
                                ? void 0
                                : ie.created_at) ??
                            t.conversation.last_activity_at;
                        if (!b) return "";
                        const L = new Date(b),
                            B = new Date();
                        if (L.toDateString() === B.toDateString())
                            return L.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                            });
                        const oe = Math.floor(
                            (B.setHours(0, 0, 0, 0) -
                                new Date(L).setHours(0, 0, 0, 0)) /
                                864e5,
                        );
                        return oe === 1
                            ? "Yesterday"
                            : oe < 7
                              ? L.toLocaleDateString([], { weekday: "long" })
                              : L.toLocaleDateString([], {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "2-digit",
                                });
                    });
                return (b, L) => {
                    var B;
                    return (
                        E(),
                        $(
                            "li",
                            {
                                class: Le([
                                    "cv-conversation-item group flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-converse-surfaceHover",
                                    { "bg-converse-surfaceHover": e.active },
                                ]),
                                onClick:
                                    L[6] ||
                                    (L[6] = (J) =>
                                        b.$emit("select", e.conversation.id)),
                            },
                            [
                                xe(
                                    Qt,
                                    {
                                        name: P.value,
                                        "avatar-url": A.value,
                                        size: 48,
                                    },
                                    null,
                                    8,
                                    ["name", "avatar-url"],
                                ),
                                S("div", Cp, [
                                    S("div", Tp, [
                                        S("span", Ep, X(P.value), 1),
                                        g.value
                                            ? (E(),
                                              $("span", Pp, X(g.value), 1))
                                            : ee("", !0),
                                    ]),
                                    S("div", Op, [
                                        S("span", Rp, [
                                            m.value &&
                                            !(
                                                (B =
                                                    e.conversation
                                                        .last_message) !=
                                                    null &&
                                                B.deleted_for_everyone
                                            )
                                                ? (E(),
                                                  we(
                                                      Xa,
                                                      {
                                                          key: 0,
                                                          status: e.conversation
                                                              .last_message
                                                              .status,
                                                      },
                                                      null,
                                                      8,
                                                      ["status"],
                                                  ))
                                                : ee("", !0),
                                            S("span", Ap, X(T.value), 1),
                                        ]),
                                        S("span", $p, [
                                            d.value
                                                ? (E(),
                                                  $("span", Lp, [
                                                      ...(L[7] ||
                                                          (L[7] = [
                                                              S(
                                                                  "svg",
                                                                  {
                                                                      viewBox:
                                                                          "0 0 24 24",
                                                                      width: "14",
                                                                      height: "14",
                                                                      fill: "currentColor",
                                                                  },
                                                                  [
                                                                      S(
                                                                          "path",
                                                                          {
                                                                              d: "M16.5 12A4.5 4.5 0 0 0 14 8.03v1.66l2.45 2.45c.03-.14.05-.28.05-.14ZM19 12c0 .94-.2 1.82-.54 2.63l1.51 1.51A8.93 8.93 0 0 0 21 12h-2ZM4.27 3 3 4.27l6 6V12a3 3 0 0 0 4.7 2.46l1.32 1.32A4.48 4.48 0 0 1 12 16.5 4.5 4.5 0 0 1 7.5 12H5.5a6.5 6.5 0 0 0 6 6.48V21h2v-2.02a6.46 6.46 0 0 0 2.79-1.05L19.73 21 21 19.73 4.27 3Z",
                                                                          },
                                                                      ),
                                                                  ],
                                                                  -1,
                                                              ),
                                                          ])),
                                                  ]))
                                                : ee("", !0),
                                            e.conversation.unread_count > 0
                                                ? (E(),
                                                  $(
                                                      "span",
                                                      Mp,
                                                      X(
                                                          e.conversation
                                                              .unread_count,
                                                      ),
                                                      1,
                                                  ))
                                                : h.value
                                                  ? (E(),
                                                    $("span", Np, [
                                                        ...(L[8] ||
                                                            (L[8] = [
                                                                S(
                                                                    "svg",
                                                                    {
                                                                        viewBox:
                                                                            "0 0 24 24",
                                                                        width: "14",
                                                                        height: "14",
                                                                        fill: "currentColor",
                                                                    },
                                                                    [
                                                                        S(
                                                                            "path",
                                                                            {
                                                                                d: "M16 3v6.5l2 3V15h-6v6l-1 1-1-1v-6H4v-2.5l2-3V3Z",
                                                                            },
                                                                        ),
                                                                    ],
                                                                    -1,
                                                                ),
                                                            ])),
                                                    ]))
                                                  : ee("", !0),
                                        ]),
                                    ]),
                                    C.value
                                        ? (E(),
                                          we(
                                              vd,
                                              {
                                                  key: 0,
                                                  "chatable-key": ge(ut)(
                                                      C.value.type,
                                                      C.value.id,
                                                  ),
                                              },
                                              null,
                                              8,
                                              ["chatable-key"],
                                          ))
                                        : ee("", !0),
                                ]),
                                S("div", Dp, [
                                    xe(
                                        gd,
                                        {
                                            pinned: h.value,
                                            muted: d.value,
                                            "is-group": v.value,
                                            onMute:
                                                L[0] ||
                                                (L[0] = (J) => w("mute")),
                                            onUnmute:
                                                L[1] ||
                                                (L[1] = (J) => w("unmute")),
                                            onPin:
                                                L[2] ||
                                                (L[2] = (J) => w("pin")),
                                            onUnpin:
                                                L[3] ||
                                                (L[3] = (J) => w("unpin")),
                                            onDelete:
                                                L[4] ||
                                                (L[4] = (J) => w("delete")),
                                            onLeave:
                                                L[5] ||
                                                (L[5] = (J) => w("leave")),
                                        },
                                        null,
                                        8,
                                        ["pinned", "muted", "is-group"],
                                    ),
                                ]),
                            ],
                            2,
                        )
                    );
                };
            },
        },
        Ip = {
            class: "cv-search-bar flex items-center gap-2 border-b border-converse-border p-2",
        },
        Up = ["placeholder"],
        Bp = {
            __name: "SearchBar",
            emits: ["message-search"],
            setup(e, { emit: t }) {
                const n = t,
                    s = G(""),
                    r = G("conversations"),
                    { refresh: i } = bt();
                let a = null;
                Qe(s, (u) => {
                    (clearTimeout(a),
                        (a = setTimeout(() => {
                            r.value === "conversations"
                                ? i(u ? { q: u } : {})
                                : n("message-search", u);
                        }, 250)));
                });
                function c() {
                    ((r.value =
                        r.value === "conversations"
                            ? "messages"
                            : "conversations"),
                        (s.value = ""),
                        i());
                }
                return (u, h) => (
                    E(),
                    $("div", Ip, [
                        An(
                            S(
                                "input",
                                {
                                    "onUpdate:modelValue":
                                        h[0] || (h[0] = (d) => (s.value = d)),
                                    type: "text",
                                    placeholder:
                                        r.value === "conversations"
                                            ? "Search chats"
                                            : "Search messages",
                                    class: "cv-search-bar__input flex-1 rounded-full bg-converse-surfaceHover px-3 py-1.5 text-sm focus:outline-none",
                                },
                                null,
                                8,
                                Up,
                            ),
                            [[Dn, s.value]],
                        ),
                        S(
                            "button",
                            {
                                type: "button",
                                class: "cv-search-bar__toggle whitespace-nowrap text-xs text-converse-accent",
                                onClick: c,
                            },
                            X(
                                r.value === "conversations"
                                    ? "Search messages"
                                    : "Search chats",
                            ),
                            1,
                        ),
                    ])
                );
            },
        },
        Fp = {
            class: "cv-modal-panel flex max-h-[85vh] w-full max-w-md flex-col rounded-cv bg-converse-surface shadow-xl",
        },
        Hp = {
            class: "cv-modal-header flex items-center justify-between border-b border-converse-border px-4 py-3",
        },
        qp = { class: "font-medium text-converse-text" },
        zp = { class: "cv-modal-body flex-1 overflow-y-auto p-4" },
        Vp = {
            key: 0,
            class: "cv-modal-footer border-t border-converse-border px-4 py-3",
        },
        vs = {
            __name: "Modal",
            props: { title: { type: String, default: "" } },
            emits: ["close"],
            setup(e, { emit: t }) {
                const n = t;
                return (s, r) => (
                    E(),
                    $(
                        "div",
                        {
                            class: "cv-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-converse-overlay/50",
                            onClick:
                                r[1] ||
                                (r[1] = Gs((i) => n("close"), ["self"])),
                        },
                        [
                            S("div", Fp, [
                                S("div", Hp, [
                                    S("h2", qp, X(e.title), 1),
                                    S(
                                        "button",
                                        {
                                            type: "button",
                                            class: "cv-modal-close text-converse-textMuted hover:text-converse-text",
                                            onClick:
                                                r[0] ||
                                                (r[0] = (i) => n("close")),
                                        },
                                        "×",
                                    ),
                                ]),
                                S("div", zp, [Vo(s.$slots, "default")]),
                                s.$slots.footer
                                    ? (E(),
                                      $("div", Vp, [Vo(s.$slots, "footer")]))
                                    : ee("", !0),
                            ]),
                        ],
                    )
                );
            },
        },
        Wp = { class: "cv-user-picker" },
        Kp = {
            key: 0,
            class: "cv-user-picker__selected mb-2 flex flex-wrap gap-2",
        },
        Jp = ["onClick"],
        Xp = {
            class: "cv-user-picker__results max-h-64 overflow-y-auto rounded border border-converse-border",
        },
        Gp = ["onClick"],
        Zp = { class: "text-sm" },
        Qp = { key: 0, class: "px-3 py-2 text-sm text-converse-textMuted" },
        ur = {
            __name: "UserPicker",
            props: {
                multiple: { type: Boolean, default: !1 },
                modelValue: { type: Array, default: () => [] },
            },
            emits: ["update:modelValue"],
            setup(e, { emit: t }) {
                const n = e,
                    s = t,
                    { search: r } = tn(),
                    i = G(""),
                    a = G([]);
                let c = null;
                (Qe(i, (d) => {
                    (clearTimeout(c),
                        (c = setTimeout(async () => {
                            a.value = await r(d);
                        }, 250)));
                }),
                    r("").then((d) => (a.value = d)));
                function u(d) {
                    return n.modelValue.some(
                        (v) => v.id === d.id && v.type === d.type,
                    );
                }
                function h(d) {
                    if (u(d)) {
                        s(
                            "update:modelValue",
                            n.modelValue.filter(
                                (v) => !(v.id === d.id && v.type === d.type),
                            ),
                        );
                        return;
                    }
                    n.multiple
                        ? s("update:modelValue", [...n.modelValue, d])
                        : s("update:modelValue", [d]);
                }
                return (d, v) => (
                    E(),
                    $("div", Wp, [
                        An(
                            S(
                                "input",
                                {
                                    "onUpdate:modelValue":
                                        v[0] || (v[0] = (w) => (i.value = w)),
                                    type: "text",
                                    placeholder: "Search people…",
                                    class: "cv-user-picker__search-input mb-2 w-full rounded border border-converse-border px-3 py-2 text-sm focus:border-converse-accent focus:outline-none",
                                },
                                null,
                                512,
                            ),
                            [[Dn, i.value]],
                        ),
                        e.modelValue.length
                            ? (E(),
                              $("div", Kp, [
                                  (E(!0),
                                  $(
                                      be,
                                      null,
                                      Ue(
                                          e.modelValue,
                                          (w) => (
                                              E(),
                                              $(
                                                  "span",
                                                  {
                                                      key: w.id,
                                                      class: "cv-user-picker__chip flex items-center gap-1 rounded-full bg-converse-bubbleOut px-2 py-1 text-xs",
                                                  },
                                                  [
                                                      ri(X(w.name) + " ", 1),
                                                      S(
                                                          "button",
                                                          {
                                                              type: "button",
                                                              class: "text-converse-textMuted hover:text-converse-textMuted",
                                                              onClick: (C) =>
                                                                  h(w),
                                                          },
                                                          "×",
                                                          8,
                                                          Jp,
                                                      ),
                                                  ],
                                              )
                                          ),
                                      ),
                                      128,
                                  )),
                              ]))
                            : ee("", !0),
                        S("ul", Xp, [
                            (E(!0),
                            $(
                                be,
                                null,
                                Ue(
                                    a.value,
                                    (w) => (
                                        E(),
                                        $(
                                            "li",
                                            {
                                                key: w.id,
                                                class: Le([
                                                    "cv-user-picker__result-row flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-converse-surfaceHover",
                                                    {
                                                        "bg-converse-bubbleOut":
                                                            u(w),
                                                    },
                                                ]),
                                                onClick: (C) => h(w),
                                            },
                                            [
                                                xe(
                                                    Qt,
                                                    {
                                                        name: w.name,
                                                        "avatar-url":
                                                            w.avatar_url,
                                                        size: 32,
                                                    },
                                                    null,
                                                    8,
                                                    ["name", "avatar-url"],
                                                ),
                                                S("span", Zp, X(w.name), 1),
                                            ],
                                            10,
                                            Gp,
                                        )
                                    ),
                                ),
                                128,
                            )),
                            a.value.length
                                ? ee("", !0)
                                : (E(), $("li", Qp, "No people found.")),
                        ]),
                    ])
                );
            },
        },
        Yp = ["disabled"],
        ev = {
            __name: "NewChatModal",
            emits: ["close", "created"],
            setup(e, { emit: t }) {
                const n = t,
                    s = G([]),
                    { createPrivate: r, setActive: i } = bt();
                async function a() {
                    if (!s.value.length) return;
                    const c = await r(s.value[0]);
                    (i(c.id), n("created", c), n("close"));
                }
                return (c, u) => (
                    E(),
                    we(
                        vs,
                        {
                            class: "cv-new-chat-modal",
                            title: "New chat",
                            onClose: u[1] || (u[1] = (h) => n("close")),
                        },
                        {
                            footer: Wt(() => [
                                S(
                                    "button",
                                    {
                                        type: "button",
                                        class: "cv-new-chat-modal__submit w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:opacity-50",
                                        disabled: !s.value.length,
                                        onClick: a,
                                    },
                                    " Start chat ",
                                    8,
                                    Yp,
                                ),
                            ]),
                            default: Wt(() => [
                                xe(
                                    ur,
                                    {
                                        modelValue: s.value,
                                        "onUpdate:modelValue":
                                            u[0] ||
                                            (u[0] = (h) => (s.value = h)),
                                        multiple: !1,
                                    },
                                    null,
                                    8,
                                    ["modelValue"],
                                ),
                            ]),
                            _: 1,
                        },
                    )
                );
            },
        },
        tv = ["disabled"],
        nv = {
            __name: "NewGroupModal",
            emits: ["close", "created"],
            setup(e, { emit: t }) {
                const n = t,
                    s = G(""),
                    r = G(""),
                    i = G([]),
                    { createGroup: a, setActive: c } = bt();
                async function u() {
                    if (!s.value.trim() || i.value.length < 1) return;
                    const h = await a(
                        s.value.trim(),
                        r.value.trim() || null,
                        i.value,
                    );
                    (c(h.id), n("created", h), n("close"));
                }
                return (h, d) => (
                    E(),
                    we(
                        vs,
                        {
                            class: "cv-new-group-modal",
                            title: "New group",
                            onClose: d[3] || (d[3] = (v) => n("close")),
                        },
                        {
                            footer: Wt(() => [
                                S(
                                    "button",
                                    {
                                        type: "button",
                                        class: "cv-new-group-modal__submit w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:opacity-50",
                                        disabled:
                                            !s.value.trim() || !i.value.length,
                                        onClick: u,
                                    },
                                    " Create group ",
                                    8,
                                    tv,
                                ),
                            ]),
                            default: Wt(() => [
                                An(
                                    S(
                                        "input",
                                        {
                                            "onUpdate:modelValue":
                                                d[0] ||
                                                (d[0] = (v) => (s.value = v)),
                                            type: "text",
                                            placeholder: "Group name",
                                            class: "cv-new-group-modal__name-input mb-2 w-full rounded border border-converse-border px-3 py-2 text-sm focus:border-converse-accent focus:outline-none",
                                        },
                                        null,
                                        512,
                                    ),
                                    [[Dn, s.value]],
                                ),
                                An(
                                    S(
                                        "input",
                                        {
                                            "onUpdate:modelValue":
                                                d[1] ||
                                                (d[1] = (v) => (r.value = v)),
                                            type: "text",
                                            placeholder:
                                                "Description (optional)",
                                            class: "cv-new-group-modal__description-input mb-3 w-full rounded border border-converse-border px-3 py-2 text-sm focus:border-converse-accent focus:outline-none",
                                        },
                                        null,
                                        512,
                                    ),
                                    [[Dn, r.value]],
                                ),
                                xe(
                                    ur,
                                    {
                                        modelValue: i.value,
                                        "onUpdate:modelValue":
                                            d[2] ||
                                            (d[2] = (v) => (i.value = v)),
                                        multiple: !0,
                                    },
                                    null,
                                    8,
                                    ["modelValue"],
                                ),
                            ]),
                            _: 1,
                        },
                    )
                );
            },
        },
        fr = {};
    let sv = -1;
    function bn() {
        const e = Ot(),
            t = Be();
        async function n(m) {
            const { data: g } = await e.get(`/conversations/${m}/messages`);
            return (
                ad(m, g.data.reverse()),
                (fr[m] = g.data.length ? g.data[0].id : null),
                t.messagesByConversation[m]
            );
        }
        async function s(m) {
            const g = fr[m];
            if (!g) return [];
            const { data: b } = await e.get(`/conversations/${m}/messages`, {
                params: { before_id: g },
            });
            return (
                b.data.length
                    ? ((fr[m] = b.data[b.data.length - 1].id),
                      cd(m, b.data.reverse()))
                    : (fr[m] = null),
                b.data
            );
        }
        async function r(m, g) {
            const b = sv--,
                L = {
                    id: b,
                    conversation_id: m,
                    chatable_type: t.currentType,
                    chatable_id: t.currentId,
                    type: g.type ?? "text",
                    body: g.body ?? null,
                    metadata: g.metadata ?? null,
                    reply_to: g.replyTo ?? null,
                    attachments: g.attachments ?? [],
                    reactions: [],
                    status: "sending",
                    created_at: new Date().toISOString(),
                    _pending: !0,
                };
            en(m, L);
            try {
                const { data: B } = await e.post(
                    `/conversations/${m}/messages`,
                    {
                        type: g.type ?? "text",
                        body: g.body ?? null,
                        reply_to_message_id: g.reply_to_message_id ?? null,
                        metadata: g.metadata ?? null,
                        attachment_ids: g.attachment_ids ?? void 0,
                    },
                );
                return (ui(m, b), en(m, B.data), B.data);
            } catch (B) {
                throw (ui(m, b), B);
            }
        }
        async function i(m, g, b) {
            const { data: L } = await e.patch(`/messages/${m}`, { body: b });
            return (en(g, L.data), L.data);
        }
        async function a(m, g) {
            await e.delete(`/messages/${m}`);
            const b = (t.messagesByConversation[g] ?? []).find(
                (L) => L.id === m,
            );
            b && en(g, { ...b, deleted_for_everyone: !0, body: null });
        }
        async function c(m, g) {
            (await e.delete(`/messages/${m}/me`), ui(g, m));
        }
        async function u(m, g) {
            const { data: b } = await e.post(`/messages/${m}/forward`, {
                conversation_ids: g,
            });
            return b.data;
        }
        async function h(m, g, b) {
            const { data: L } = await e.post(`/messages/${m}/reactions`, {
                emoji: b,
            });
            v(g, m, L.data);
        }
        async function d(m, g) {
            const { data: b } = await e.delete(`/messages/${m}/reactions`);
            v(g, m, b.data);
        }
        function v(m, g, b) {
            const L = (t.messagesByConversation[m] ?? []).find(
                (B) => B.id === g,
            );
            L && en(m, { ...L, reactions: b });
        }
        async function w(m) {
            await e.post(`/messages/${m}/star`);
        }
        async function C(m) {
            await e.delete(`/messages/${m}/star`);
        }
        async function O(m) {
            const g = new FormData();
            g.append("file", m);
            const { data: b } = await e.post("/attachments", g, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return b.data;
        }
        async function P(m) {
            await e.post(`/conversations/${m}/receipts/delivered`);
        }
        async function A(m, g) {
            await e.post(`/conversations/${m}/receipts/read`, {
                up_to_message_id: g,
            });
        }
        async function T(m, g = null) {
            const { data: b } = await e.get("/messages/search", {
                params: { q: m, conversation_id: g },
            });
            return b.data;
        }
        return {
            load: n,
            loadOlder: s,
            send: r,
            update: i,
            deleteForEveryone: a,
            deleteForMe: c,
            forward: u,
            react: h,
            unreact: d,
            star: w,
            unstar: C,
            uploadAttachment: O,
            markDelivered: P,
            markRead: A,
            search: T,
        };
    }
    function Uc() {
        const e = Ot(),
            t = Be();
        async function n(a) {
            const { data: c } = await e.get(
                `/conversations/${a}/pinned-messages`,
            );
            return (ld(a, c.data), c.data);
        }
        async function s(a) {
            (await e.post(`/messages/${a.id}/pin`), Va(a.conversation_id, a));
        }
        async function r(a) {
            (await e.delete(`/messages/${a.id}/pin`),
                Wa(a.conversation_id, a.id));
        }
        function i(a) {
            return t.pinnedByConversation[a] ?? [];
        }
        return { list: n, pin: s, unpin: r, pinnedFor: i };
    }
    const rv = ["href"],
        iv = ["src"],
        ov = { class: "cv-link-preview-card__body p-2" },
        av = { key: 0, class: "text-xs uppercase text-converse-textMuted" },
        cv = { key: 1, class: "text-sm font-medium text-converse-text" },
        lv = { key: 2, class: "line-clamp-2 text-xs text-converse-textMuted" },
        uv = {
            __name: "LinkPreviewCard",
            props: { preview: { type: Object, required: !0 } },
            setup(e) {
                return (t, n) => {
                    var s;
                    return (s = e.preview) != null && s.url
                        ? (E(),
                          $(
                              "a",
                              {
                                  key: 0,
                                  href: e.preview.url,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  class: "cv-link-preview-card mt-1 block overflow-hidden rounded border border-converse-border bg-converse-surface hover:bg-converse-surfaceHover",
                              },
                              [
                                  e.preview.image
                                      ? (E(),
                                        $(
                                            "img",
                                            {
                                                key: 0,
                                                src: e.preview.image,
                                                alt: "",
                                                class: "h-32 w-full object-cover",
                                            },
                                            null,
                                            8,
                                            iv,
                                        ))
                                      : ee("", !0),
                                  S("div", ov, [
                                      e.preview.site_name
                                          ? (E(),
                                            $(
                                                "p",
                                                av,
                                                X(e.preview.site_name),
                                                1,
                                            ))
                                          : ee("", !0),
                                      e.preview.title
                                          ? (E(),
                                            $("p", cv, X(e.preview.title), 1))
                                          : ee("", !0),
                                      e.preview.description
                                          ? (E(),
                                            $(
                                                "p",
                                                lv,
                                                X(e.preview.description),
                                                1,
                                            ))
                                          : ee("", !0),
                                  ]),
                              ],
                              8,
                              rv,
                          ))
                        : ee("", !0);
                };
            },
        },
        fv = { class: "cv-text-message" },
        dv = {
            class: "cv-text-message__body whitespace-pre-wrap break-words text-sm",
        },
        Bc = {
            __name: "TextMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                return (t, n) => {
                    var s;
                    return (
                        E(),
                        $("div", fv, [
                            S("p", dv, X(e.message.body), 1),
                            (s = e.message.metadata) != null && s.link_preview
                                ? (E(),
                                  we(
                                      uv,
                                      {
                                          key: 0,
                                          preview:
                                              e.message.metadata.link_preview,
                                      },
                                      null,
                                      8,
                                      ["preview"],
                                  ))
                                : ee("", !0),
                        ])
                    );
                };
            },
        },
        hv = { class: "cv-image-message" },
        pv = { class: "cv-image-message__grid grid grid-cols-2 gap-1" },
        vv = ["href"],
        mv = ["src", "alt"],
        gv = {
            key: 0,
            class: "cv-image-message__caption mt-1 whitespace-pre-wrap break-words text-sm",
        },
        bv = {
            __name: "ImageMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                return (t, n) => (
                    E(),
                    $("div", hv, [
                        S("div", pv, [
                            (E(!0),
                            $(
                                be,
                                null,
                                Ue(
                                    e.message.attachments,
                                    (s) => (
                                        E(),
                                        $(
                                            "a",
                                            {
                                                key: s.id,
                                                href: s.url,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                            },
                                            [
                                                S(
                                                    "img",
                                                    {
                                                        src:
                                                            s.thumbnail_url ||
                                                            s.url,
                                                        alt: s.original_filename,
                                                        class: "max-h-64 w-full rounded object-cover",
                                                    },
                                                    null,
                                                    8,
                                                    mv,
                                                ),
                                            ],
                                            8,
                                            vv,
                                        )
                                    ),
                                ),
                                128,
                            )),
                        ]),
                        e.message.body
                            ? (E(), $("p", gv, X(e.message.body), 1))
                            : ee("", !0),
                    ])
                );
            },
        },
        yv = { class: "cv-video-message" },
        _v = ["src"],
        wv = {
            key: 0,
            class: "cv-video-message__caption mt-1 whitespace-pre-wrap break-words text-sm",
        },
        xv = {
            __name: "VideoMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                return (t, n) => (
                    E(),
                    $("div", yv, [
                        (E(!0),
                        $(
                            be,
                            null,
                            Ue(
                                e.message.attachments,
                                (s) => (
                                    E(),
                                    $(
                                        "video",
                                        {
                                            key: s.id,
                                            src: s.url,
                                            controls: "",
                                            class: "max-h-64 max-w-full rounded",
                                        },
                                        null,
                                        8,
                                        _v,
                                    )
                                ),
                            ),
                            128,
                        )),
                        e.message.body
                            ? (E(), $("p", wv, X(e.message.body), 1))
                            : ee("", !0),
                    ])
                );
            },
        },
        kv = { class: "cv-audio-message" },
        Sv = ["src"],
        Cv = {
            __name: "AudioMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                return (t, n) => (
                    E(),
                    $("div", kv, [
                        (E(!0),
                        $(
                            be,
                            null,
                            Ue(
                                e.message.attachments,
                                (s) => (
                                    E(),
                                    $(
                                        "audio",
                                        {
                                            key: s.id,
                                            src: s.url,
                                            controls: "",
                                            class: "max-w-full",
                                        },
                                        null,
                                        8,
                                        Sv,
                                    )
                                ),
                            ),
                            128,
                        )),
                    ])
                );
            },
        },
        Tv = { class: "cv-voice-message flex items-center gap-2" },
        Ev = {
            class: "cv-voice-message__waveform flex h-6 flex-1 items-end gap-0.5",
        },
        Pv = ["src"],
        Ov = {
            __name: "VoiceMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                const t = e,
                    n = G(null),
                    s = G(!1),
                    r = ve(() => {
                        var c;
                        return (
                            ((c = t.message.attachments) == null
                                ? void 0
                                : c[0]) ?? null
                        );
                    }),
                    i = ve(() => {
                        var u;
                        const c =
                            (u = t.message.metadata) == null
                                ? void 0
                                : u.waveform;
                        return Array.isArray(c) && c.length
                            ? c
                            : Array.from(
                                  { length: 24 },
                                  (h, d) => 4 + ((d * 7) % 16),
                              );
                    });
                function a() {
                    n.value && (s.value ? n.value.pause() : n.value.play());
                }
                return (c, u) => (
                    E(),
                    $("div", Tv, [
                        S(
                            "button",
                            {
                                type: "button",
                                class: "cv-voice-message__toggle flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-converse-accent text-white",
                                onClick: a,
                            },
                            X(s.value ? "❚❚" : "▶"),
                            1,
                        ),
                        S("div", Ev, [
                            (E(!0),
                            $(
                                be,
                                null,
                                Ue(
                                    i.value,
                                    (h, d) => (
                                        E(),
                                        $(
                                            "span",
                                            {
                                                key: d,
                                                class: "cv-voice-message__bar w-0.5 rounded bg-converse-accent/60",
                                                style: $t({ height: h + "px" }),
                                            },
                                            null,
                                            4,
                                        )
                                    ),
                                ),
                                128,
                            )),
                        ]),
                        r.value
                            ? (E(),
                              $(
                                  "audio",
                                  {
                                      key: 0,
                                      ref_key: "audioEl",
                                      ref: n,
                                      src: r.value.url,
                                      class: "hidden",
                                      onPlay:
                                          u[0] ||
                                          (u[0] = (h) => (s.value = !0)),
                                      onPause:
                                          u[1] ||
                                          (u[1] = (h) => (s.value = !1)),
                                      onEnded:
                                          u[2] ||
                                          (u[2] = (h) => (s.value = !1)),
                                  },
                                  null,
                                  40,
                                  Pv,
                              ))
                            : ee("", !0),
                    ])
                );
            },
        },
        Rv = ["href"],
        Av = { class: "cv-document-message__meta min-w-0" },
        $v = { class: "block truncate text-sm font-medium" },
        Lv = { class: "block text-xs text-converse-textMuted" },
        Mv = {
            __name: "DocumentMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                function t(n) {
                    if (!n) return "";
                    const s = n / 1024;
                    return s < 1024
                        ? `${Math.round(s)} KB`
                        : `${(s / 1024).toFixed(1)} MB`;
                }
                return (n, s) => (
                    E(!0),
                    $(
                        be,
                        null,
                        Ue(
                            e.message.attachments,
                            (r) => (
                                E(),
                                $(
                                    "a",
                                    {
                                        key: r.id,
                                        href: r.url,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        class: "cv-document-message flex items-center gap-2 rounded border border-converse-border bg-converse-surface p-2 hover:bg-converse-surfaceHover",
                                    },
                                    [
                                        s[0] ||
                                            (s[0] = S(
                                                "span",
                                                { class: "text-2xl" },
                                                "📄",
                                                -1,
                                            )),
                                        S("span", Av, [
                                            S(
                                                "span",
                                                $v,
                                                X(r.original_filename),
                                                1,
                                            ),
                                            S(
                                                "span",
                                                Lv,
                                                X(t(r.size_bytes)),
                                                1,
                                            ),
                                        ]),
                                    ],
                                    8,
                                    Rv,
                                )
                            ),
                        ),
                        128,
                    )
                );
            },
        },
        Nv = ["href"],
        Dv = { class: "cv-location-message__meta min-w-0" },
        jv = { class: "block truncate text-sm font-medium" },
        Iv = {
            key: 0,
            class: "block truncate text-xs text-converse-textMuted",
        },
        Uv = {
            __name: "LocationMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                const t = e,
                    n = ve(() => {
                        const { lat: s, lng: r } = t.message.metadata ?? {};
                        return `https://maps.google.com/?q=${s},${r}`;
                    });
                return (s, r) => {
                    var i, a;
                    return (
                        E(),
                        $(
                            "a",
                            {
                                href: n.value,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                class: "cv-location-message flex items-center gap-2 rounded border border-converse-border bg-converse-surface p-2 hover:bg-converse-surfaceHover",
                            },
                            [
                                r[0] ||
                                    (r[0] = S(
                                        "span",
                                        { class: "text-2xl" },
                                        "📍",
                                        -1,
                                    )),
                                S("span", Dv, [
                                    S(
                                        "span",
                                        jv,
                                        X(
                                            ((i = e.message.metadata) == null
                                                ? void 0
                                                : i.name) || "Shared location",
                                        ),
                                        1,
                                    ),
                                    (a = e.message.metadata) != null &&
                                    a.address
                                        ? (E(),
                                          $(
                                              "span",
                                              Iv,
                                              X(e.message.metadata.address),
                                              1,
                                          ))
                                        : ee("", !0),
                                ]),
                            ],
                            8,
                            Nv,
                        )
                    );
                };
            },
        },
        Bv = {
            class: "cv-contact-message rounded border border-converse-border bg-converse-surface p-2",
        },
        Fv = { class: "cv-contact-message__header flex items-center gap-2" },
        Hv = { class: "text-sm font-medium" },
        qv = {
            __name: "ContactMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                return (t, n) => {
                    var s, r, i;
                    return (
                        E(),
                        $("div", Bv, [
                            S("div", Fv, [
                                n[0] ||
                                    (n[0] = S(
                                        "span",
                                        { class: "text-2xl" },
                                        "👤",
                                        -1,
                                    )),
                                S(
                                    "span",
                                    Hv,
                                    X(
                                        (s = e.message.metadata) == null
                                            ? void 0
                                            : s.name,
                                    ),
                                    1,
                                ),
                            ]),
                            (E(!0),
                            $(
                                be,
                                null,
                                Ue(
                                    ((r = e.message.metadata) == null
                                        ? void 0
                                        : r.phones) ?? [],
                                    (a) => (
                                        E(),
                                        $(
                                            "p",
                                            {
                                                key: a,
                                                class: "mt-1 text-xs text-converse-textMuted",
                                            },
                                            X(a),
                                            1,
                                        )
                                    ),
                                ),
                                128,
                            )),
                            (E(!0),
                            $(
                                be,
                                null,
                                Ue(
                                    ((i = e.message.metadata) == null
                                        ? void 0
                                        : i.emails) ?? [],
                                    (a) => (
                                        E(),
                                        $(
                                            "p",
                                            {
                                                key: a,
                                                class: "text-xs text-converse-textMuted",
                                            },
                                            X(a),
                                            1,
                                        )
                                    ),
                                ),
                                128,
                            )),
                        ])
                    );
                };
            },
        },
        zv = {
            class: "cv-system-message text-center text-xs text-converse-textMuted",
        },
        Vv = {
            __name: "SystemMessage",
            props: { message: { type: Object, required: !0 } },
            setup(e) {
                const t = e,
                    { get: n } = tn(),
                    s = ve(() => {
                        const r = t.message.metadata ?? {},
                            i = r.actor_type
                                ? n({ type: r.actor_type, id: r.actor_id }).name
                                : "Someone",
                            a = r.target_type
                                ? n({ type: r.target_type, id: r.target_id })
                                : null;
                        switch (r.event) {
                            case "participant_added": {
                                const c = (r.targets ?? [])
                                    .map((u) => n(u).name)
                                    .join(", ");
                                return `${i} added ${c}`;
                            }
                            case "participant_removed":
                                return `${i} removed ${(a == null ? void 0 : a.name) ?? "someone"}`;
                            case "participant_left":
                                return `${(a == null ? void 0 : a.name) ?? "Someone"} left`;
                            case "participant_role_changed":
                                return `${(a == null ? void 0 : a.name) ?? "Someone"} is now ${r.role === "admin" ? "an admin" : "a member"}`;
                            default:
                                return "Group updated";
                        }
                    });
                return (r, i) => (E(), $("p", zv, X(s.value), 1));
            },
        },
        Wv = {
            class: "cv-reply-preview flex items-start justify-between gap-2 rounded border-l-4 border-converse-accent bg-converse-overlay/5 px-2 py-1",
        },
        Kv = { class: "cv-reply-preview__text min-w-0" },
        Jv = { class: "text-xs font-medium text-converse-accent" },
        Xv = { class: "truncate text-xs text-converse-textMuted" },
        Fc = {
            __name: "ReplyPreview",
            props: {
                replyTo: { type: Object, required: !0 },
                dismissible: { type: Boolean, default: !1 },
            },
            emits: ["dismiss"],
            setup(e) {
                const { get: t } = tn();
                return (n, s) => (
                    E(),
                    $("div", Wv, [
                        S("div", Kv, [
                            S(
                                "p",
                                Jv,
                                X(
                                    ge(t)({
                                        type: e.replyTo.chatable_type,
                                        id: e.replyTo.chatable_id,
                                    }).name,
                                ),
                                1,
                            ),
                            S("p", Xv, X(e.replyTo.body), 1),
                        ]),
                        e.dismissible
                            ? (E(),
                              $(
                                  "button",
                                  {
                                      key: 0,
                                      type: "button",
                                      class: "text-converse-textMuted hover:text-converse-text",
                                      onClick:
                                          s[0] ||
                                          (s[0] = (r) => n.$emit("dismiss")),
                                  },
                                  "×",
                              ))
                            : ee("", !0),
                    ])
                );
            },
        },
        Gv = {
            class: "cv-reaction-picker flex gap-1 rounded-full border border-converse-border bg-converse-surface px-2 py-1 shadow",
        },
        Zv = ["onClick"],
        Qv = {
            __name: "ReactionPicker",
            emits: ["pick"],
            setup(e, { emit: t }) {
                const n = ["👍", "❤️", "😂", "😮", "😢", "🙏"],
                    s = t;
                return (r, i) => (
                    E(),
                    $("div", Gv, [
                        (E(),
                        $(
                            be,
                            null,
                            Ue(n, (a) =>
                                S(
                                    "button",
                                    {
                                        key: a,
                                        type: "button",
                                        class: "text-lg hover:scale-125",
                                        onClick: (c) => s("pick", a),
                                    },
                                    X(a),
                                    9,
                                    Zv,
                                ),
                            ),
                            64,
                        )),
                    ])
                );
            },
        },
        Yv = { key: 0, class: "cv-reaction-pills mt-1 flex flex-wrap gap-1" },
        em = ["onClick"],
        tm = {
            __name: "ReactionPills",
            props: { reactions: { type: Array, default: () => [] } },
            emits: ["toggle"],
            setup(e, { emit: t }) {
                const n = t;
                return (s, r) =>
                    e.reactions.length
                        ? (E(),
                          $("div", Yv, [
                              (E(!0),
                              $(
                                  be,
                                  null,
                                  Ue(
                                      e.reactions,
                                      (i) => (
                                          E(),
                                          $(
                                              "button",
                                              {
                                                  key: i.emoji,
                                                  type: "button",
                                                  class: Le([
                                                      "cv-reaction-pills__pill flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs",
                                                      i.self
                                                          ? "border-converse-accent bg-converse-bubbleOut"
                                                          : "border-converse-border bg-converse-surface",
                                                  ]),
                                                  onClick: (a) =>
                                                      n("toggle", i.emoji),
                                              },
                                              [
                                                  S(
                                                      "span",
                                                      null,
                                                      X(i.emoji),
                                                      1,
                                                  ),
                                                  S(
                                                      "span",
                                                      null,
                                                      X(i.count),
                                                      1,
                                                  ),
                                              ],
                                              10,
                                              em,
                                          )
                                      ),
                                  ),
                                  128,
                              )),
                          ]))
                        : ee("", !0);
            },
        },
        nm = { class: "cv-forward-modal__list max-h-72 overflow-y-auto" },
        sm = ["onClick"],
        rm = { class: "text-sm" },
        im = ["disabled"],
        om = {
            __name: "ForwardModal",
            props: { messageId: { type: Number, required: !0 } },
            emits: ["close", "forwarded"],
            setup(e, { emit: t }) {
                const n = e,
                    s = t,
                    r = Be(),
                    { get: i } = tn(),
                    { forward: a } = bn(),
                    c = G([]);
                function u(v) {
                    if (v.type === "group") return v.name || "Group";
                    const w = (v.participants ?? []).find(
                        (C) => Yt(C) !== r.currentKey,
                    );
                    return w
                        ? i({ type: w.chatable_type, id: w.chatable_id }).name
                        : "Unknown";
                }
                function h(v) {
                    c.value = c.value.includes(v)
                        ? c.value.filter((w) => w !== v)
                        : [...c.value, v];
                }
                async function d() {
                    c.value.length &&
                        (await a(n.messageId, c.value),
                        s("forwarded"),
                        s("close"));
                }
                return (v, w) => (
                    E(),
                    we(
                        vs,
                        {
                            class: "cv-forward-modal",
                            title: "Forward message",
                            onClose: w[0] || (w[0] = (C) => s("close")),
                        },
                        {
                            footer: Wt(() => [
                                S(
                                    "button",
                                    {
                                        type: "button",
                                        class: "cv-forward-modal__submit w-full rounded bg-converse-accent py-2 text-sm font-medium text-white disabled:opacity-50",
                                        disabled: !c.value.length,
                                        onClick: d,
                                    },
                                    " Forward ",
                                    8,
                                    im,
                                ),
                            ]),
                            default: Wt(() => [
                                S("ul", nm, [
                                    (E(!0),
                                    $(
                                        be,
                                        null,
                                        Ue(
                                            ge(r).conversations,
                                            (C) => (
                                                E(),
                                                $(
                                                    "li",
                                                    {
                                                        key: C.id,
                                                        class: Le([
                                                            "cv-forward-modal__item flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-converse-surfaceHover",
                                                            {
                                                                "bg-converse-bubbleOut":
                                                                    c.value.includes(
                                                                        C.id,
                                                                    ),
                                                            },
                                                        ]),
                                                        onClick: (O) => h(C.id),
                                                    },
                                                    [
                                                        xe(
                                                            Qt,
                                                            {
                                                                name: u(C),
                                                                "avatar-url":
                                                                    C.avatar_url,
                                                                size: 32,
                                                            },
                                                            null,
                                                            8,
                                                            [
                                                                "name",
                                                                "avatar-url",
                                                            ],
                                                        ),
                                                        S(
                                                            "span",
                                                            rm,
                                                            X(u(C)),
                                                            1,
                                                        ),
                                                    ],
                                                    10,
                                                    sm,
                                                )
                                            ),
                                        ),
                                        128,
                                    )),
                                ]),
                            ]),
                            _: 1,
                        },
                    )
                );
            },
        },
        am = {
            key: 0,
            class: "cv-message-bubble__pin-indicator absolute -top-2 -left-2 text-xs",
            title: "Pinned",
        },
        cm = { key: 2, class: "text-sm italic text-converse-textMuted" },
        lm = {
            class: "cv-message-bubble__meta mt-0.5 flex items-center justify-end gap-1 text-[10px] text-converse-textMuted",
        },
        um = { key: 0 },
        fm = {
            key: 4,
            class: "cv-message-bubble__actions absolute -top-3 right-1 hidden gap-1 group-hover:flex",
        },
        dm = {
            key: 5,
            class: "cv-message-bubble__reaction-picker absolute -top-12 right-1 z-10",
        },
        hm = {
            key: 6,
            class: "cv-message-bubble__menu absolute right-1 top-6 z-10 w-40 rounded border border-converse-border bg-converse-surface text-sm shadow-lg",
        },
        pm = {
            key: 7,
            class: "cv-message-bubble__pin-error mt-1 text-xs text-converse-danger",
        },
        Oi = {
            __name: "MessageBubble",
            props: { message: { type: Object, required: !0 } },
            emits: ["reply", "edit", "star-changed"],
            setup(e, { emit: t }) {
                const n = {
                        text: Bc,
                        image: bv,
                        video: xv,
                        audio: Cv,
                        voice: Ov,
                        document: Mv,
                        location: Uv,
                        contact: qv,
                    },
                    s = e,
                    r = t,
                    i = Be(),
                    {
                        react: a,
                        unreact: c,
                        star: u,
                        unstar: h,
                        deleteForMe: d,
                        deleteForEveryone: v,
                    } = bn(),
                    { pin: w, unpin: C } = Uc(),
                    O = G(""),
                    P = ve(() => Yt(s.message) === i.currentKey),
                    A = ve(
                        () =>
                            s.message.type === "system" ||
                            s.message.chatable_id === null,
                    ),
                    T = ve(() => n[s.message.type] ?? Bc),
                    m = G(!1),
                    g = G(!1),
                    b = G(!1);
                function L() {
                    m.value = !m.value;
                }
                async function B(Q) {
                    var ne;
                    g.value = !1;
                    const K =
                        (ne = s.message.reactions) == null
                            ? void 0
                            : ne.find((et) => et.self);
                    K && K.emoji === Q
                        ? await c(s.message.id, s.message.conversation_id)
                        : await a(s.message.id, s.message.conversation_id, Q);
                }
                async function J(Q) {
                    var ne;
                    const K =
                        (ne = s.message.reactions) == null
                            ? void 0
                            : ne.find((et) => et.self);
                    K && K.emoji === Q
                        ? await c(s.message.id, s.message.conversation_id)
                        : await a(s.message.id, s.message.conversation_id, Q);
                }
                async function oe() {
                    ((m.value = !1),
                        s.message.is_starred_by_me
                            ? await h(s.message.id)
                            : await u(s.message.id),
                        (s.message.is_starred_by_me =
                            !s.message.is_starred_by_me),
                        r("star-changed", s.message));
                }
                async function ie() {
                    var Q, K;
                    ((m.value = !1), (O.value = ""));
                    try {
                        (s.message.is_pinned
                            ? await C(s.message)
                            : await w(s.message),
                            (s.message.is_pinned = !s.message.is_pinned));
                    } catch (ne) {
                        O.value =
                            ((K =
                                (Q = ne.response) == null ? void 0 : Q.data) ==
                            null
                                ? void 0
                                : K.message) ?? "Could not update pin.";
                    }
                }
                async function z() {
                    ((m.value = !1),
                        await d(s.message.id, s.message.conversation_id));
                }
                async function Z() {
                    ((m.value = !1),
                        await v(s.message.id, s.message.conversation_id));
                }
                return (Q, K) =>
                    A.value
                        ? (E(),
                          we(Vv, { key: 0, message: e.message }, null, 8, [
                              "message",
                          ]))
                        : (E(),
                          $(
                              "div",
                              {
                                  key: 1,
                                  class: Le([
                                      "cv-message-bubble group flex",
                                      P.value ? "justify-end" : "justify-start",
                                  ]),
                              },
                              [
                                  S(
                                      "div",
                                      {
                                          class: Le([
                                              "cv-message-bubble__content relative max-w-[70%] rounded-cv px-3 py-1.5 shadow-sm",
                                              P.value
                                                  ? "rounded-tr-sm bg-converse-bubbleOut"
                                                  : "rounded-tl-sm bg-converse-bubbleIn",
                                          ]),
                                      },
                                      [
                                          e.message.is_pinned
                                              ? (E(), $("span", am, "📌"))
                                              : ee("", !0),
                                          e.message.reply_to
                                              ? (E(),
                                                we(
                                                    Fc,
                                                    {
                                                        key: 1,
                                                        "reply-to":
                                                            e.message.reply_to,
                                                        class: "mb-1",
                                                    },
                                                    null,
                                                    8,
                                                    ["reply-to"],
                                                ))
                                              : ee("", !0),
                                          e.message.deleted_for_everyone
                                              ? (E(),
                                                $(
                                                    "p",
                                                    cm,
                                                    "This message was deleted",
                                                ))
                                              : (E(),
                                                we(
                                                    ju(T.value),
                                                    {
                                                        key: 3,
                                                        message: e.message,
                                                    },
                                                    null,
                                                    8,
                                                    ["message"],
                                                )),
                                          S("div", lm, [
                                              S(
                                                  "span",
                                                  null,
                                                  X(
                                                      new Date(
                                                          e.message.created_at,
                                                      ).toLocaleTimeString([], {
                                                          hour: "2-digit",
                                                          minute: "2-digit",
                                                      }),
                                                  ),
                                                  1,
                                              ),
                                              e.message.edited_at
                                                  ? (E(),
                                                    $("span", um, "(edited)"))
                                                  : ee("", !0),
                                              P.value
                                                  ? (E(),
                                                    we(
                                                        Xa,
                                                        {
                                                            key: 1,
                                                            status: e.message
                                                                .status,
                                                        },
                                                        null,
                                                        8,
                                                        ["status"],
                                                    ))
                                                  : ee("", !0),
                                          ]),
                                          xe(
                                              tm,
                                              {
                                                  reactions:
                                                      e.message.reactions ?? [],
                                                  onToggle: J,
                                              },
                                              null,
                                              8,
                                              ["reactions"],
                                          ),
                                          e.message.deleted_for_everyone
                                              ? ee("", !0)
                                              : (E(),
                                                $("div", fm, [
                                                    S(
                                                        "button",
                                                        {
                                                            type: "button",
                                                            class: "rounded-full bg-converse-surface px-1.5 text-xs shadow",
                                                            onClick:
                                                                K[0] ||
                                                                (K[0] = (ne) =>
                                                                    (g.value =
                                                                        !g.value)),
                                                        },
                                                        "😊",
                                                    ),
                                                    S(
                                                        "button",
                                                        {
                                                            type: "button",
                                                            class: "rounded-full bg-converse-surface px-1.5 text-xs shadow",
                                                            onClick:
                                                                K[1] ||
                                                                (K[1] = (ne) =>
                                                                    r(
                                                                        "reply",
                                                                        e.message,
                                                                    )),
                                                        },
                                                        "↩",
                                                    ),
                                                    S(
                                                        "button",
                                                        {
                                                            type: "button",
                                                            class: "rounded-full bg-converse-surface px-1.5 text-xs shadow",
                                                            onClick: L,
                                                        },
                                                        "⋮",
                                                    ),
                                                ])),
                                          g.value
                                              ? (E(),
                                                $("div", dm, [
                                                    xe(Qv, { onPick: B }),
                                                ]))
                                              : ee("", !0),
                                          m.value
                                              ? (E(),
                                                $("div", hm, [
                                                    S(
                                                        "button",
                                                        {
                                                            type: "button",
                                                            class: "block w-full px-3 py-2 text-left hover:bg-converse-surfaceHover",
                                                            onClick:
                                                                K[2] ||
                                                                (K[2] = (
                                                                    ne,
                                                                ) => {
                                                                    ((b.value =
                                                                        !0),
                                                                        (m.value =
                                                                            !1));
                                                                }),
                                                        },
                                                        "Forward",
                                                    ),
                                                    S(
                                                        "button",
                                                        {
                                                            type: "button",
                                                            class: "block w-full px-3 py-2 text-left hover:bg-converse-surfaceHover",
                                                            onClick: oe,
                                                        },
                                                        X(
                                                            e.message
                                                                .is_starred_by_me
                                                                ? "Unstar"
                                                                : "Star",
                                                        ),
                                                        1,
                                                    ),
                                                    S(
                                                        "button",
                                                        {
                                                            type: "button",
                                                            class: "block w-full px-3 py-2 text-left hover:bg-converse-surfaceHover",
                                                            onClick: ie,
                                                        },
                                                        X(
                                                            e.message.is_pinned
                                                                ? "Unpin"
                                                                : "Pin",
                                                        ),
                                                        1,
                                                    ),
                                                    P.value &&
                                                    e.message.type === "text"
                                                        ? (E(),
                                                          $(
                                                              "button",
                                                              {
                                                                  key: 0,
                                                                  type: "button",
                                                                  class: "block w-full px-3 py-2 text-left hover:bg-converse-surfaceHover",
                                                                  onClick:
                                                                      K[3] ||
                                                                      (K[3] = (
                                                                          ne,
                                                                      ) => {
                                                                          (r(
                                                                              "edit",
                                                                              e.message,
                                                                          ),
                                                                              (m.value =
                                                                                  !1));
                                                                      }),
                                                              },
                                                              "Edit",
                                                          ))
                                                        : ee("", !0),
                                                    S(
                                                        "button",
                                                        {
                                                            type: "button",
                                                            class: "block w-full px-3 py-2 text-left text-converse-danger hover:bg-converse-surfaceHover",
                                                            onClick: z,
                                                        },
                                                        "Delete for me",
                                                    ),
                                                    P.value
                                                        ? (E(),
                                                          $(
                                                              "button",
                                                              {
                                                                  key: 1,
                                                                  type: "button",
                                                                  class: "block w-full px-3 py-2 text-left text-converse-danger hover:bg-converse-surfaceHover",
                                                                  onClick: Z,
                                                              },
                                                              "Delete for everyone",
                                                          ))
                                                        : ee("", !0),
                                                ]))
                                              : ee("", !0),
                                          O.value
                                              ? (E(), $("p", pm, X(O.value), 1))
                                              : ee("", !0),
                                      ],
                                      2,
                                  ),
                                  b.value
                                      ? (E(),
                                        we(
                                            om,
                                            {
                                                key: 0,
                                                "message-id": e.message.id,
                                                onClose:
                                                    K[4] ||
                                                    (K[4] = (ne) =>
                                                        (b.value = !1)),
                                            },
                                            null,
                                            8,
                                            ["message-id"],
                                        ))
                                      : ee("", !0),
                              ],
                              2,
                          ));
            },
        },
        vm = { key: 0, class: "text-sm text-converse-textMuted" },
        mm = { key: 1, class: "text-sm text-converse-textMuted" },
        gm = {
            key: 2,
            class: "cv-starred-messages-panel__list flex flex-col gap-2",
        },
        bm = ["onClick"],
        ym = ["onClick"],
        _m = {
            __name: "StarredMessagesPanel",
            emits: ["close"],
            setup(e, { emit: t }) {
                const n = t,
                    s = Ot(),
                    { setActive: r } = bt(),
                    { resolve: i, get: a } = tn(),
                    c = Be(),
                    u = G([]),
                    h = G(!0),
                    d = G(1),
                    v = G(!1);
                async function w(m) {
                    var L, B, J;
                    const { data: g } = await s.get("/starred-messages", {
                            params: { page: m },
                        }),
                        b = g.data
                            .map((oe) => O(oe))
                            .filter((oe) => oe !== null);
                    if (b.length) {
                        const oe = [
                            ...new Map(
                                b.map((ie) => [ut(ie.type, ie.id), ie]),
                            ).values(),
                        ];
                        await i(oe);
                    }
                    (m === 1
                        ? (u.value = g.data)
                        : (u.value = [...u.value, ...g.data]),
                        (d.value =
                            ((L = g.meta) == null ? void 0 : L.current_page) ??
                            m),
                        (v.value =
                            (((B = g.meta) == null ? void 0 : B.current_page) ??
                                m) <
                            (((J = g.meta) == null ? void 0 : J.last_page) ??
                                m)));
                }
                jt(async () => {
                    (await w(1), (h.value = !1));
                });
                async function C() {
                    await w(d.value + 1);
                }
                function O(m) {
                    if (!m.conversation || m.conversation.type !== "private")
                        return null;
                    const g = (m.conversation.participants ?? []).find(
                        (b) => Yt(b) !== c.currentKey,
                    );
                    return g
                        ? { type: g.chatable_type, id: g.chatable_id }
                        : null;
                }
                function P(m) {
                    if (!m.conversation) return "";
                    if (m.conversation.type === "group")
                        return m.conversation.name || "Group";
                    const g = O(m);
                    return g ? a(g).name : "Unknown";
                }
                function A(m) {
                    (r(m.conversation_id), n("close"));
                }
                function T(m) {
                    m.is_starred_by_me ||
                        (u.value = u.value.filter((g) => g.id !== m.id));
                }
                return (m, g) => (
                    E(),
                    we(
                        vs,
                        {
                            class: "cv-starred-messages-panel",
                            title: "Starred messages",
                            onClose: g[0] || (g[0] = (b) => n("close")),
                        },
                        {
                            default: Wt(() => [
                                h.value
                                    ? (E(), $("p", vm, "Loading…"))
                                    : u.value.length
                                      ? (E(),
                                        $("div", gm, [
                                            (E(!0),
                                            $(
                                                be,
                                                null,
                                                Ue(
                                                    u.value,
                                                    (b) => (
                                                        E(),
                                                        $(
                                                            "div",
                                                            {
                                                                key: b.id,
                                                                class: "cv-starred-messages-panel__item rounded",
                                                            },
                                                            [
                                                                S(
                                                                    "p",
                                                                    {
                                                                        class: "cv-starred-messages-panel__conversation-label cursor-pointer px-1 text-xs text-converse-textMuted hover:underline",
                                                                        onClick:
                                                                            (
                                                                                L,
                                                                            ) =>
                                                                                A(
                                                                                    b,
                                                                                ),
                                                                    },
                                                                    " in " +
                                                                        X(P(b)),
                                                                    9,
                                                                    bm,
                                                                ),
                                                                S(
                                                                    "div",
                                                                    {
                                                                        class: "cursor-pointer hover:bg-converse-surfaceHover",
                                                                        onClick:
                                                                            (
                                                                                L,
                                                                            ) =>
                                                                                A(
                                                                                    b,
                                                                                ),
                                                                    },
                                                                    [
                                                                        xe(
                                                                            Oi,
                                                                            {
                                                                                message:
                                                                                    b,
                                                                                onStarChanged:
                                                                                    T,
                                                                            },
                                                                            null,
                                                                            8,
                                                                            [
                                                                                "message",
                                                                            ],
                                                                        ),
                                                                    ],
                                                                    8,
                                                                    ym,
                                                                ),
                                                            ],
                                                        )
                                                    ),
                                                ),
                                                128,
                                            )),
                                            v.value
                                                ? (E(),
                                                  $(
                                                      "button",
                                                      {
                                                          key: 0,
                                                          type: "button",
                                                          class: "cv-starred-messages-panel__load-more mt-2 text-sm text-converse-accent",
                                                          onClick: C,
                                                      },
                                                      " Load more ",
                                                  ))
                                                : ee("", !0),
                                        ]))
                                      : (E(),
                                        $("p", mm, "No starred messages yet.")),
                            ]),
                            _: 1,
                        },
                    )
                );
            },
        };
    function Hc() {
        const e = Ot();
        async function t() {
            const { data: r } = await e.get("/blocked-users");
            return r.data;
        }
        async function n(r) {
            await e.post("/blocked-users", {
                chatable_type: r.type,
                chatable_id: r.id,
            });
        }
        async function s(r, i) {
            await e.delete(`/blocked-users/${r}/${i}`);
        }
        return { list: t, block: n, unblock: s };
    }
    const wm = { key: 0, class: "cv-blocked-users-panel__add-form mb-3" },
        xm = ["disabled"],
        km = { key: 1, class: "text-sm text-converse-textMuted" },
        Sm = { key: 2, class: "text-sm text-converse-textMuted" },
        Cm = { key: 3, class: "cv-blocked-users-panel__list" },
        Tm = { class: "flex-1 text-sm" },
        Em = ["onClick"],
        Pm = {
            __name: "BlockedUsersPanel",
            emits: ["close"],
            setup(e, { emit: t }) {
                const n = t,
                    { list: s, block: r, unblock: i } = Hc(),
                    { resolve: a, get: c } = tn(),
                    u = G([]),
                    h = G(!1),
                    d = G([]),
                    v = G(!0);
                async function w() {
                    v.value = !0;
                    const P = await s();
                    ((u.value = P),
                        await a(
                            P.map((A) => ({
                                type: A.blocked_type,
                                id: A.blocked_id,
                            })),
                        ),
                        (v.value = !1));
                }
                jt(w);
                async function C() {
                    d.value.length &&
                        (await r(d.value[0]),
                        (d.value = []),
                        (h.value = !1),
                        await w());
                }
                async function O(P) {
                    (await i(P.blocked_type, P.blocked_id), await w());
                }
                return (P, A) => (
                    E(),
                    we(
                        vs,
                        {
                            class: "cv-blocked-users-panel",
                            title: "Blocked users",
                            onClose: A[2] || (A[2] = (T) => n("close")),
                        },
                        {
                            default: Wt(() => [
                                S(
                                    "button",
                                    {
                                        type: "button",
                                        class: "mb-3 text-sm text-converse-accent",
                                        onClick:
                                            A[0] ||
                                            (A[0] = (T) =>
                                                (h.value = !h.value)),
                                    },
                                    X(h.value ? "Cancel" : "+ Block someone"),
                                    1,
                                ),
                                h.value
                                    ? (E(),
                                      $("div", wm, [
                                          xe(
                                              ur,
                                              {
                                                  modelValue: d.value,
                                                  "onUpdate:modelValue":
                                                      A[1] ||
                                                      (A[1] = (T) =>
                                                          (d.value = T)),
                                                  multiple: !1,
                                              },
                                              null,
                                              8,
                                              ["modelValue"],
                                          ),
                                          S(
                                              "button",
                                              {
                                                  type: "button",
                                                  class: "mt-2 w-full rounded bg-converse-danger py-1.5 text-sm text-white disabled:opacity-50",
                                                  disabled: !d.value.length,
                                                  onClick: C,
                                              },
                                              " Block ",
                                              8,
                                              xm,
                                          ),
                                      ]))
                                    : ee("", !0),
                                v.value
                                    ? (E(), $("p", km, "Loading…"))
                                    : u.value.length
                                      ? (E(),
                                        $("ul", Cm, [
                                            (E(!0),
                                            $(
                                                be,
                                                null,
                                                Ue(
                                                    u.value,
                                                    (T) => (
                                                        E(),
                                                        $(
                                                            "li",
                                                            {
                                                                key: T.id,
                                                                class: "cv-blocked-users-panel__row flex items-center gap-2 py-1.5",
                                                            },
                                                            [
                                                                xe(
                                                                    Qt,
                                                                    {
                                                                        name: ge(
                                                                            c,
                                                                        )({
                                                                            type: T.blocked_type,
                                                                            id: T.blocked_id,
                                                                        }).name,
                                                                        "avatar-url":
                                                                            ge(
                                                                                c,
                                                                            )({
                                                                                type: T.blocked_type,
                                                                                id: T.blocked_id,
                                                                            })
                                                                                .avatar_url,
                                                                        size: 32,
                                                                    },
                                                                    null,
                                                                    8,
                                                                    [
                                                                        "name",
                                                                        "avatar-url",
                                                                    ],
                                                                ),
                                                                S(
                                                                    "span",
                                                                    Tm,
                                                                    X(
                                                                        ge(c)({
                                                                            type: T.blocked_type,
                                                                            id: T.blocked_id,
                                                                        }).name,
                                                                    ),
                                                                    1,
                                                                ),
                                                                S(
                                                                    "button",
                                                                    {
                                                                        type: "button",
                                                                        class: "text-xs text-converse-accent",
                                                                        onClick:
                                                                            (
                                                                                m,
                                                                            ) =>
                                                                                O(
                                                                                    T,
                                                                                ),
                                                                    },
                                                                    "Unblock",
                                                                    8,
                                                                    Em,
                                                                ),
                                                            ],
                                                        )
                                                    ),
                                                ),
                                                128,
                                            )),
                                        ]))
                                      : (E(), $("p", Sm, "No blocked users.")),
                            ]),
                            _: 1,
                        },
                    )
                );
            },
        },
        qc = "converse:";
    function Ri(e, t) {
        try {
            const n = localStorage.getItem(qc + e);
            return n !== null ? JSON.parse(n) : t;
        } catch {
            return t;
        }
    }
    function Ai(e, t) {
        try {
            localStorage.setItem(qc + e, JSON.stringify(t));
        } catch {}
    }
    function Om() {
        var e;
        return (
            typeof window < "u" &&
            ((e = window.matchMedia) == null
                ? void 0
                : e.call(window, "(prefers-color-scheme: dark)").matches)
        );
    }
    const Fn = G(Ri("theme", null) ?? (Om() ? "dark" : "light")),
        $i = G(Ri("sidebarWidth", 320)),
        Li = G(Ri("settingsPanelWidth", 320));
    function zc(e) {
        typeof document < "u" &&
            document.documentElement.setAttribute("data-theme", e);
    }
    (zc(Fn.value),
        Qe(Fn, (e) => {
            (Ai("theme", e), zc(e));
        }),
        Qe($i, (e) => Ai("sidebarWidth", e)),
        Qe(Li, (e) => Ai("settingsPanelWidth", e)));
    function Mi() {
        return {
            theme: Fn,
            setTheme: (e) => {
                Fn.value = e;
            },
            toggleTheme: () => {
                Fn.value = Fn.value === "dark" ? "light" : "dark";
            },
            sidebarWidth: $i,
            setSidebarWidth: (e) => {
                $i.value = e;
            },
            settingsPanelWidth: Li,
            setSettingsPanelWidth: (e) => {
                Li.value = e;
            },
        };
    }
    const Rm = {
            class: "cv-conversation-list flex h-full flex-col bg-converse-surface",
        },
        Am = {
            class: "cv-conversation-list__header flex items-center justify-between px-4 py-3",
        },
        $m = { class: "cv-conversation-list__actions flex items-center gap-1" },
        Lm = {
            key: 0,
            class: "cv-conversation-list__menu absolute right-0 top-full z-20 w-56 rounded-cv border border-converse-border bg-converse-surface py-1 text-sm shadow-lg",
        },
        Mm = {
            key: 1,
            class: "cv-conversation-list__filters flex items-center gap-2 overflow-x-auto px-3 pb-2",
        },
        Nm = ["onClick"],
        Dm = { class: "cv-conversation-list__items flex-1 overflow-y-auto" },
        jm = {
            key: 0,
            class: "cv-conversation-list__empty p-4 text-center text-sm text-converse-textMuted",
        },
        Im = {
            __name: "ConversationList",
            emits: ["message-search", "open-settings"],
            setup(e, { emit: t }) {
                const n = t,
                    s = Be(),
                    { refresh: r, setActive: i } = bt(),
                    { theme: a, toggleTheme: c } = Mi(),
                    {
                        filter: u,
                        setFilter: h,
                        searchOpen: d,
                        toggleSearch: v,
                    } = fi(),
                    w = [
                        { key: "all", label: "All" },
                        { key: "unread", label: "Unread" },
                        { key: "favourites", label: "Favourites" },
                        { key: "groups", label: "Groups" },
                    ],
                    C = G(!1),
                    O = G(!1),
                    P = G(!1),
                    A = G(!1),
                    T = G(!1),
                    m = G(!1),
                    g = G(null);
                jt(() => r());
                function b(ie) {
                    g.value && !g.value.contains(ie.target) && (m.value = !1);
                }
                (Qe(m, (ie) => {
                    ie
                        ? document.addEventListener("click", b)
                        : document.removeEventListener("click", b);
                }),
                    Wr(() => document.removeEventListener("click", b)));
                function L() {
                    ((P.value = !P.value), r(P.value ? { archived: !0 } : {}));
                }
                function B(ie) {
                    i(ie);
                }
                function J(ie) {
                    var z;
                    return !!(
                        ie.pinned_at ||
                        ((z = ie.me) != null && z.pinned_at)
                    );
                }
                const oe = ve(() => {
                    switch (u.value) {
                        case "unread":
                            return s.conversations.filter(
                                (ie) => ie.unread_count > 0,
                            );
                        case "favourites":
                            return s.conversations.filter(J);
                        case "groups":
                            return s.conversations.filter(
                                (ie) => ie.type === "group",
                            );
                        default:
                            return s.conversations;
                    }
                });
                return (ie, z) => (
                    E(),
                    $("div", Rm, [
                        S("div", Am, [
                            z[18] ||
                                (z[18] = S(
                                    "h1",
                                    {
                                        class: "text-xl font-bold text-converse-text",
                                    },
                                    "WhatsApp",
                                    -1,
                                )),
                            S("div", $m, [
                                S(
                                    "button",
                                    {
                                        type: "button",
                                        title: "Search",
                                        class: "flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover",
                                        onClick:
                                            z[0] ||
                                            (z[0] = (...Z) =>
                                                ge(v) && ge(v)(...Z)),
                                    },
                                    [
                                        ...(z[15] ||
                                            (z[15] = [
                                                S(
                                                    "svg",
                                                    {
                                                        viewBox: "0 0 24 24",
                                                        width: "20",
                                                        height: "20",
                                                        fill: "currentColor",
                                                    },
                                                    [
                                                        S("path", {
                                                            d: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z",
                                                        }),
                                                    ],
                                                    -1,
                                                ),
                                            ])),
                                    ],
                                ),
                                S(
                                    "button",
                                    {
                                        type: "button",
                                        title: "New chat",
                                        class: "flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover",
                                        onClick:
                                            z[1] ||
                                            (z[1] = (Z) => (C.value = !0)),
                                    },
                                    [
                                        ...(z[16] ||
                                            (z[16] = [
                                                S(
                                                    "svg",
                                                    {
                                                        viewBox: "0 0 24 24",
                                                        width: "20",
                                                        height: "20",
                                                        fill: "currentColor",
                                                    },
                                                    [
                                                        S("path", {
                                                            d: "M20.49 3.51a3 3 0 0 0-4.24 0L5 14.76V19h4.24L20.49 7.75a3 3 0 0 0 0-4.24ZM4 21h16v-1.5H4Z",
                                                        }),
                                                    ],
                                                    -1,
                                                ),
                                            ])),
                                    ],
                                ),
                                S(
                                    "div",
                                    {
                                        ref_key: "menuRoot",
                                        ref: g,
                                        class: "relative",
                                    },
                                    [
                                        S(
                                            "button",
                                            {
                                                type: "button",
                                                title: "Menu",
                                                class: "flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover",
                                                onClick:
                                                    z[2] ||
                                                    (z[2] = (Z) =>
                                                        (m.value = !m.value)),
                                            },
                                            [
                                                ...(z[17] ||
                                                    (z[17] = [
                                                        S(
                                                            "svg",
                                                            {
                                                                viewBox:
                                                                    "0 0 24 24",
                                                                width: "20",
                                                                height: "20",
                                                                fill: "currentColor",
                                                            },
                                                            [
                                                                S("path", {
                                                                    d: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
                                                                }),
                                                            ],
                                                            -1,
                                                        ),
                                                    ])),
                                            ],
                                        ),
                                        m.value
                                            ? (E(),
                                              $("div", Lm, [
                                                  S(
                                                      "button",
                                                      {
                                                          type: "button",
                                                          class: "block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover",
                                                          onClick:
                                                              z[3] ||
                                                              (z[3] = (Z) => {
                                                                  ((O.value =
                                                                      !0),
                                                                      (m.value =
                                                                          !1));
                                                              }),
                                                      },
                                                      "New group",
                                                  ),
                                                  S(
                                                      "button",
                                                      {
                                                          type: "button",
                                                          class: "block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover",
                                                          onClick:
                                                              z[4] ||
                                                              (z[4] = (Z) => {
                                                                  ((A.value =
                                                                      !0),
                                                                      (m.value =
                                                                          !1));
                                                              }),
                                                      },
                                                      "Starred messages",
                                                  ),
                                                  S(
                                                      "button",
                                                      {
                                                          type: "button",
                                                          class: "block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover",
                                                          onClick:
                                                              z[5] ||
                                                              (z[5] = (Z) => {
                                                                  ((T.value =
                                                                      !0),
                                                                      (m.value =
                                                                          !1));
                                                              }),
                                                      },
                                                      "Blocked contacts",
                                                  ),
                                                  S(
                                                      "button",
                                                      {
                                                          type: "button",
                                                          class: "block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover",
                                                          onClick:
                                                              z[6] ||
                                                              (z[6] = (Z) => {
                                                                  (L(),
                                                                      (m.value =
                                                                          !1));
                                                              }),
                                                      },
                                                      X(
                                                          P.value
                                                              ? "Back to chats"
                                                              : "Archived chats",
                                                      ),
                                                      1,
                                                  ),
                                                  S(
                                                      "button",
                                                      {
                                                          type: "button",
                                                          class: "block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover",
                                                          onClick:
                                                              z[7] ||
                                                              (z[7] = (Z) => {
                                                                  (ge(c)(),
                                                                      (m.value =
                                                                          !1));
                                                              }),
                                                      },
                                                      X(
                                                          ge(a) === "dark"
                                                              ? "Light mode"
                                                              : "Dark mode",
                                                      ),
                                                      1,
                                                  ),
                                                  S(
                                                      "button",
                                                      {
                                                          type: "button",
                                                          class: "block w-full px-4 py-2 text-left text-converse-text hover:bg-converse-surfaceHover",
                                                          onClick:
                                                              z[8] ||
                                                              (z[8] = (Z) => {
                                                                  (n(
                                                                      "open-settings",
                                                                  ),
                                                                      (m.value =
                                                                          !1));
                                                              }),
                                                      },
                                                      "Settings",
                                                  ),
                                              ]))
                                            : ee("", !0),
                                    ],
                                    512,
                                ),
                            ]),
                        ]),
                        ge(d)
                            ? (E(),
                              we(Bp, {
                                  key: 0,
                                  onMessageSearch:
                                      z[9] ||
                                      (z[9] = (Z) => n("message-search", Z)),
                              }))
                            : (E(),
                              $("div", Mm, [
                                  (E(),
                                  $(
                                      be,
                                      null,
                                      Ue(w, (Z) =>
                                          S(
                                              "button",
                                              {
                                                  key: Z.key,
                                                  type: "button",
                                                  class: Le([
                                                      "shrink-0 rounded-full px-3 py-1 text-sm font-medium",
                                                      ge(u) === Z.key
                                                          ? "bg-converse-accent/15 text-converse-accent"
                                                          : "bg-converse-surfaceHover text-converse-text hover:bg-converse-border/50",
                                                  ]),
                                                  onClick: (Q) => ge(h)(Z.key),
                                              },
                                              X(Z.label),
                                              11,
                                              Nm,
                                          ),
                                      ),
                                      64,
                                  )),
                                  S(
                                      "button",
                                      {
                                          type: "button",
                                          title: "New chat",
                                          class: "ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-converse-surfaceHover text-converse-textMuted hover:bg-converse-border/50",
                                          onClick:
                                              z[10] ||
                                              (z[10] = (Z) => (C.value = !0)),
                                      },
                                      [
                                          ...(z[19] ||
                                              (z[19] = [
                                                  S(
                                                      "svg",
                                                      {
                                                          viewBox: "0 0 24 24",
                                                          width: "16",
                                                          height: "16",
                                                          fill: "currentColor",
                                                      },
                                                      [
                                                          S("path", {
                                                              d: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z",
                                                          }),
                                                      ],
                                                      -1,
                                                  ),
                                              ])),
                                      ],
                                  ),
                              ])),
                        S("ul", Dm, [
                            (E(!0),
                            $(
                                be,
                                null,
                                Ue(
                                    oe.value,
                                    (Z) => (
                                        E(),
                                        we(
                                            jp,
                                            {
                                                key: Z.id,
                                                conversation: Z,
                                                active:
                                                    Z.id ===
                                                    ge(s).activeConversationId,
                                                onSelect: B,
                                            },
                                            null,
                                            8,
                                            ["conversation", "active"],
                                        )
                                    ),
                                ),
                                128,
                            )),
                            oe.value.length
                                ? ee("", !0)
                                : (E(),
                                  $("li", jm, " No conversations here. ")),
                        ]),
                        C.value
                            ? (E(),
                              we(ev, {
                                  key: 2,
                                  onClose:
                                      z[11] || (z[11] = (Z) => (C.value = !1)),
                              }))
                            : ee("", !0),
                        O.value
                            ? (E(),
                              we(nv, {
                                  key: 3,
                                  onClose:
                                      z[12] || (z[12] = (Z) => (O.value = !1)),
                              }))
                            : ee("", !0),
                        A.value
                            ? (E(),
                              we(_m, {
                                  key: 4,
                                  onClose:
                                      z[13] || (z[13] = (Z) => (A.value = !1)),
                              }))
                            : ee("", !0),
                        T.value
                            ? (E(),
                              we(Pm, {
                                  key: 5,
                                  onClose:
                                      z[14] || (z[14] = (Z) => (T.value = !1)),
                              }))
                            : ee("", !0),
                    ])
                );
            },
        },
        Um = {
            class: "cv-media-panel flex h-full flex-col bg-converse-surface",
        },
        Bm = { class: "cv-media-panel__body flex-1 overflow-y-auto p-3" },
        Fm = {
            key: 0,
            class: "cv-media-panel__empty p-4 text-center text-sm text-converse-textMuted",
        },
        Hm = { key: 1, class: "cv-media-panel__grid grid grid-cols-3 gap-1" },
        qm = ["title"],
        zm = ["src"],
        Vm = ["src", "alt"],
        Wm = {
            __name: "MediaPanel",
            setup(e) {
                const t = Be(),
                    n = ve(() => {
                        const s = [];
                        for (const r of t.conversations) {
                            const i = t.messagesByConversation[r.id] ?? [];
                            for (const a of i)
                                if (
                                    !a.deleted_for_everyone &&
                                    !(a.type !== "image" && a.type !== "video")
                                )
                                    for (const c of a.attachments ?? [])
                                        s.push({
                                            key: `${a.id}-${c.id}`,
                                            conversationName:
                                                r.type === "group"
                                                    ? r.name || "Group"
                                                    : null,
                                            type: a.type,
                                            url: c.url ?? c.thumbnail_url,
                                            createdAt: a.created_at,
                                            isOwn: Yt(a) === t.currentKey,
                                        });
                        }
                        return s.sort(
                            (r, i) =>
                                new Date(i.createdAt) - new Date(r.createdAt),
                        );
                    });
                return (s, r) => (
                    E(),
                    $("div", Um, [
                        r[0] ||
                            (r[0] = S(
                                "div",
                                {
                                    class: "cv-media-panel__header flex items-center gap-3 border-b border-converse-border px-4 py-3",
                                },
                                [
                                    S(
                                        "h1",
                                        {
                                            class: "text-lg font-semibold text-converse-text",
                                        },
                                        "Media",
                                    ),
                                ],
                                -1,
                            )),
                        S("div", Bm, [
                            n.value.length
                                ? (E(),
                                  $("div", Hm, [
                                      (E(!0),
                                      $(
                                          be,
                                          null,
                                          Ue(
                                              n.value,
                                              (i) => (
                                                  E(),
                                                  $(
                                                      "div",
                                                      {
                                                          key: i.key,
                                                          class: "cv-media-panel__item relative aspect-square overflow-hidden rounded-sm bg-converse-surfaceHover",
                                                          title:
                                                              i.conversationName ??
                                                              "",
                                                      },
                                                      [
                                                          i.type === "video"
                                                              ? (E(),
                                                                $(
                                                                    "video",
                                                                    {
                                                                        key: 0,
                                                                        src: i.url,
                                                                        class: "h-full w-full object-cover",
                                                                        muted: "",
                                                                    },
                                                                    null,
                                                                    8,
                                                                    zm,
                                                                ))
                                                              : (E(),
                                                                $(
                                                                    "img",
                                                                    {
                                                                        key: 1,
                                                                        src: i.url,
                                                                        alt:
                                                                            i.conversationName ??
                                                                            "media",
                                                                        class: "h-full w-full object-cover",
                                                                    },
                                                                    null,
                                                                    8,
                                                                    Vm,
                                                                )),
                                                      ],
                                                      8,
                                                      qm,
                                                  )
                                              ),
                                          ),
                                          128,
                                      )),
                                  ]))
                                : (E(),
                                  $(
                                      "p",
                                      Fm,
                                      " Photos and videos from your open chats will show up here. ",
                                  )),
                        ]),
                    ])
                );
            },
        },
        Km = 45e3;
    let dr = null;
    function Vc() {
        const e = Ot();
        function t() {
            dr || (s(), (dr = setInterval(s, Km)));
        }
        function n() {
            (clearInterval(dr), (dr = null));
        }
        async function s() {
            await e.post("/presence/heartbeat");
        }
        async function r(i) {
            const { data: a } = await e.get(
                `/users/${i.type}/${i.id}/presence`,
            );
            return (za(ut(i.type, i.id), a.data), a.data);
        }
        return { start: t, stop: n, fetchPresence: r };
    }
    const Jm = {
            class: "cv-chat-header flex items-center gap-2 border-b border-converse-border bg-converse-surface px-3 py-2",
        },
        Xm = { class: "cv-chat-header__meta min-w-0" },
        Gm = { class: "truncate font-medium leading-tight" },
        Zm = { key: 0, class: "truncate text-xs text-converse-accent" },
        Qm = { key: 1, class: "truncate text-xs text-converse-textMuted" },
        Ym = { class: "cv-chat-header__actions flex items-center gap-1" },
        eg = {
            __name: "ChatHeader",
            props: {
                conversation: { type: Object, required: !0 },
                searchOpen: { type: Boolean, default: !1 },
            },
            emits: ["back", "open-info", "toggle-search"],
            setup(e, { emit: t }) {
                const n = e,
                    s = t,
                    r = Be(),
                    { resolve: i, get: a } = tn(),
                    { fetchPresence: c } = Vc(),
                    u = ve(() => {
                        if (n.conversation.type !== "private") return null;
                        const O = (n.conversation.participants ?? []).find(
                            (P) => Yt(P) !== r.currentKey,
                        );
                        return O
                            ? { type: O.chatable_type, id: O.chatable_id }
                            : null;
                    });
                async function h() {
                    u.value && (await Promise.all([i([u.value]), c(u.value)]));
                }
                (jt(h), Qe(u, h));
                const d = ve(() =>
                        n.conversation.type === "group"
                            ? n.conversation.name || "Group"
                            : u.value
                              ? a(u.value).name
                              : "Unknown",
                    ),
                    v = ve(() =>
                        n.conversation.avatar_url
                            ? n.conversation.avatar_url
                            : u.value
                              ? a(u.value).avatar_url
                              : null,
                    ),
                    w = ve(() => {
                        const O = r.typingByConversation[n.conversation.id];
                        return !O || !O.size
                            ? []
                            : Array.from(O).map((P) => a(P).name);
                    }),
                    C = ve(() => {
                        var m;
                        if (n.conversation.type === "group") {
                            const g =
                                ((m = n.conversation.participants) == null
                                    ? void 0
                                    : m.length) ?? 0;
                            return g ? `${g} participants` : "";
                        }
                        if (!u.value) return "";
                        const O =
                            r.presenceByUser[ut(u.value.type, u.value.id)];
                        if (!O) return "";
                        if (O.is_online) return "online";
                        if (!O.last_seen_at) return "";
                        const P = new Date(O.last_seen_at),
                            A = P.toDateString() === new Date().toDateString(),
                            T = P.toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                            });
                        return A
                            ? `last seen today at ${T}`
                            : `last seen ${P.toLocaleDateString([], { day: "2-digit", month: "short" })} at ${T}`;
                    });
                return (O, P) => (
                    E(),
                    $("div", Jm, [
                        S(
                            "button",
                            {
                                type: "button",
                                class: "sm:hidden",
                                onClick: P[0] || (P[0] = (A) => s("back")),
                            },
                            "←",
                        ),
                        S(
                            "div",
                            {
                                class: "cv-chat-header__info flex flex-1 cursor-pointer items-center gap-3 overflow-hidden",
                                onClick: P[1] || (P[1] = (A) => s("open-info")),
                            },
                            [
                                xe(
                                    Qt,
                                    {
                                        name: d.value,
                                        "avatar-url": v.value,
                                        size: 40,
                                    },
                                    null,
                                    8,
                                    ["name", "avatar-url"],
                                ),
                                S("div", Xm, [
                                    S("p", Gm, X(d.value), 1),
                                    w.value.length
                                        ? (E(),
                                          $(
                                              "p",
                                              Zm,
                                              X(w.value.join(", ")) +
                                                  " typing…",
                                              1,
                                          ))
                                        : C.value
                                          ? (E(), $("p", Qm, X(C.value), 1))
                                          : ee("", !0),
                                ]),
                            ],
                        ),
                        S("div", Ym, [
                            S(
                                "button",
                                {
                                    type: "button",
                                    title: "Search in chat",
                                    class: Le([
                                        "flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover",
                                        {
                                            "text-converse-accent":
                                                e.searchOpen,
                                        },
                                    ]),
                                    onClick:
                                        P[2] ||
                                        (P[2] = (A) => s("toggle-search")),
                                },
                                [
                                    ...(P[4] ||
                                        (P[4] = [
                                            S(
                                                "svg",
                                                {
                                                    viewBox: "0 0 24 24",
                                                    width: "20",
                                                    height: "20",
                                                    fill: "currentColor",
                                                },
                                                [
                                                    S("path", {
                                                        d: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z",
                                                    }),
                                                ],
                                                -1,
                                            ),
                                        ])),
                                ],
                                2,
                            ),
                            S(
                                "button",
                                {
                                    type: "button",
                                    title: "Chat info",
                                    class: "flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover",
                                    onClick:
                                        P[3] || (P[3] = (A) => s("open-info")),
                                },
                                [
                                    ...(P[5] ||
                                        (P[5] = [
                                            S(
                                                "svg",
                                                {
                                                    viewBox: "0 0 24 24",
                                                    width: "20",
                                                    height: "20",
                                                    fill: "currentColor",
                                                },
                                                [
                                                    S("path", {
                                                        d: "M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
                                                    }),
                                                ],
                                                -1,
                                            ),
                                        ])),
                                ],
                            ),
                        ]),
                    ])
                );
            },
        },
        Wc = [
            { key: "default", label: "Default", css: null },
            { key: "teal", label: "Teal", css: "#d9fdd3" },
            { key: "sand", label: "Sand", css: "#f0e6d6" },
            { key: "sky", label: "Sky", css: "#dcf0fb" },
            { key: "blush", label: "Blush", css: "#fbe4e6" },
            { key: "lilac", label: "Lilac", css: "#e8e0fb" },
            { key: "mint", label: "Mint", css: "#dff5ec" },
            { key: "charcoal", label: "Charcoal", css: "#1f2c33" },
        ];
    function tg(e) {
        if (!e) return null;
        const t = Wc.find((n) => n.key === e);
        return t ? t.css : e.startsWith("#") ? e : null;
    }
    const ng = (e, t) => {
            const n = e.__vccOpts || e;
            for (const [s, r] of t) n[s] = r;
            return n;
        },
        sg = {
            class: "cv-message-list__messages mx-auto flex max-w-3xl flex-col gap-2",
        },
        rg = ng(
            {
                __name: "MessageList",
                props: { conversationId: { type: Number, required: !0 } },
                emits: ["reply", "edit"],
                setup(e, { emit: t }) {
                    const n = e,
                        s = t,
                        r = Be(),
                        { loadOlder: i } = bn(),
                        a = ve(() =>
                            r.conversations.find(
                                (m) => m.id === n.conversationId,
                            ),
                        ),
                        c = ve(() => {
                            var m, g;
                            return tg(
                                (g = (m = a.value) == null ? void 0 : m.me) ==
                                    null
                                    ? void 0
                                    : g.wallpaper,
                            );
                        }),
                        u = G(null),
                        h = G(null);
                    let d = null,
                        v = !0;
                    const w = ve(
                        () => r.messagesByConversation[n.conversationId] ?? [],
                    );
                    function C() {
                        const m = u.value;
                        return m
                            ? m.scrollHeight - m.scrollTop - m.clientHeight <
                                  150
                            : !0;
                    }
                    function O() {
                        Is(() => {
                            u.value &&
                                (u.value.scrollTop = u.value.scrollHeight);
                        });
                    }
                    async function P(m) {
                        if (m[0].isIntersecting) {
                            const g = u.value,
                                b = (g == null ? void 0 : g.scrollHeight) ?? 0;
                            (await i(n.conversationId),
                                Is(() => {
                                    g && (g.scrollTop = g.scrollHeight - b);
                                }));
                        }
                    }
                    function A() {
                        (d == null || d.disconnect(),
                            h.value &&
                                ((d = new IntersectionObserver(P, {
                                    root: u.value,
                                })),
                                d.observe(h.value)));
                    }
                    (jt(() => {
                        (A(), O());
                    }),
                        Ho(() => {
                            v && O();
                        }),
                        Qe(
                            () => n.conversationId,
                            () => {
                                ((v = !0), Is(A));
                            },
                        ));
                    function T() {
                        v = C();
                    }
                    return (m, g) => (
                        E(),
                        $(
                            "div",
                            {
                                ref_key: "scrollEl",
                                ref: u,
                                class: Le([
                                    "cv-message-list h-full overflow-y-auto px-3 py-2 sm:px-12",
                                    {
                                        "cv-message-list--pattern bg-converse-chatBg":
                                            !c.value,
                                    },
                                ]),
                                style: $t(
                                    c.value ? { backgroundColor: c.value } : {},
                                ),
                                onScroll: T,
                            },
                            [
                                S(
                                    "div",
                                    {
                                        ref_key: "sentinelEl",
                                        ref: h,
                                        class: "cv-message-list__sentinel h-1",
                                    },
                                    null,
                                    512,
                                ),
                                S("div", sg, [
                                    (E(!0),
                                    $(
                                        be,
                                        null,
                                        Ue(
                                            w.value,
                                            (b) => (
                                                E(),
                                                we(
                                                    Oi,
                                                    {
                                                        id: `cv-message-${b.id}`,
                                                        key: b.id,
                                                        message: b,
                                                        onReply:
                                                            g[0] ||
                                                            (g[0] = (L) =>
                                                                s("reply", L)),
                                                        onEdit:
                                                            g[1] ||
                                                            (g[1] = (L) =>
                                                                s("edit", L)),
                                                    },
                                                    null,
                                                    8,
                                                    ["id", "message"],
                                                )
                                            ),
                                        ),
                                        128,
                                    )),
                                ]),
                            ],
                            38,
                        )
                    );
                },
            },
            [["__scopeId", "data-v-d1a1a171"]],
        ),
        ig = {
            class: "cv-emoji-picker grid grid-cols-8 gap-1 rounded border border-converse-border bg-converse-surface p-2 shadow-lg",
        },
        og = ["onClick"],
        ag = {
            __name: "EmojiPicker",
            emits: ["pick"],
            setup(e, { emit: t }) {
                const n = [
                        "😀",
                        "😂",
                        "😍",
                        "😊",
                        "😉",
                        "😢",
                        "😮",
                        "😡",
                        "👍",
                        "👎",
                        "🙏",
                        "👏",
                        "🎉",
                        "❤️",
                        "🔥",
                        "💯",
                    ],
                    s = t;
                return (r, i) => (
                    E(),
                    $("div", ig, [
                        (E(),
                        $(
                            be,
                            null,
                            Ue(n, (a) =>
                                S(
                                    "button",
                                    {
                                        key: a,
                                        type: "button",
                                        class: "cv-emoji-picker__item text-lg hover:scale-125",
                                        onClick: (c) => s("pick", a),
                                    },
                                    X(a),
                                    9,
                                    og,
                                ),
                            ),
                            64,
                        )),
                    ])
                );
            },
        },
        cg = { class: "cv-attachment-picker" },
        lg = ["disabled"],
        ug = {
            __name: "AttachmentPicker",
            emits: ["uploaded"],
            setup(e, { emit: t }) {
                const n = t,
                    { uploadAttachment: s } = bn(),
                    r = G(null),
                    i = G(!1);
                function a() {
                    var u;
                    (u = r.value) == null || u.click();
                }
                async function c(u) {
                    const h = Array.from(u.target.files ?? []);
                    if (((u.target.value = ""), !!h.length)) {
                        i.value = !0;
                        try {
                            for (const d of h) {
                                const v = await s(d),
                                    w = v.mime_type.startsWith("image/")
                                        ? "image"
                                        : v.mime_type.startsWith("video/")
                                          ? "video"
                                          : v.mime_type.startsWith("audio/")
                                            ? "audio"
                                            : "document";
                                n("uploaded", { attachment: v, type: w });
                            }
                        } finally {
                            i.value = !1;
                        }
                    }
                }
                return (u, h) => (
                    E(),
                    $("div", cg, [
                        S(
                            "button",
                            {
                                type: "button",
                                title: "Attach",
                                class: "flex h-9 w-9 items-center justify-center rounded-full text-converse-textMuted hover:bg-converse-surfaceHover hover:text-converse-accent disabled:opacity-50",
                                disabled: i.value,
                                onClick: a,
                            },
                            [
                                ...(h[0] ||
                                    (h[0] = [
                                        S(
                                            "svg",
                                            {
                                                viewBox: "0 0 24 24",
                                                width: "22",
                                                height: "22",
                                                fill: "currentColor",
                                            },
                                            [
                                                S("path", {
                                                    d: "M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z",
                                                }),
                                            ],
                                            -1,
                                        ),
                                    ])),
                            ],
                            8,
                            lg,
                        ),
                        S(
                            "input",
                            {
                                ref_key: "inputEl",
                                ref: r,
                                type: "file",
                                multiple: "",
                                class: "hidden",
                                onChange: c,
                            },
                            null,
                            544,
                        ),
                    ])
                );
            },
        },
        fg = {
            __name: "VoiceRecorder",
            emits: ["recorded"],
            setup(e, { emit: t }) {
                const n = t,
                    { uploadAttachment: s } = bn(),
                    r = G(!1);
                let i = null,
                    a = [],
                    c = 0;
                async function u() {
                    if (r.value) {
                        i == null || i.stop();
                        return;
                    }
                    const h = await navigator.mediaDevices.getUserMedia({
                        audio: !0,
                    });
                    ((i = new MediaRecorder(h)),
                        (a = []),
                        (c = Date.now()),
                        (i.ondataavailable = (d) => a.push(d.data)),
                        (i.onstop = async () => {
                            ((r.value = !1),
                                h.getTracks().forEach((O) => O.stop()));
                            const d = Math.round((Date.now() - c) / 1e3),
                                v = new Blob(a, { type: "audio/webm" }),
                                w = new File([v], `voice-${Date.now()}.webm`, {
                                    type: "audio/webm",
                                }),
                                C = await s(w);
                            n("recorded", {
                                attachment: C,
                                durationSeconds: d,
                            });
                        }),
                        i.start(),
                        (r.value = !0));
                }
                return (h, d) => (
                    E(),
                    $(
                        "button",
                        {
                            type: "button",
                            class: Le([
                                "cv-voice-recorder text-xl",
                                r.value
                                    ? "text-converse-danger"
                                    : "text-converse-textMuted hover:text-converse-accent",
                            ]),
                            onClick: u,
                        },
                        X(r.value ? "⏹" : "🎤"),
                        3,
                    )
                );
            },
        };
    function ms(e) {
        "@babel/helpers - typeof";
        return (
            (ms =
                typeof Symbol == "function" &&
                typeof Symbol.iterator == "symbol"
                    ? function (t) {
                          return typeof t;
                      }
                    : function (t) {
                          return t &&
                              typeof Symbol == "function" &&
                              t.constructor === Symbol &&
                              t !== Symbol.prototype
                              ? "symbol"
                              : typeof t;
                      }),
            ms(e)
        );
    }
    function Ke(e, t) {
        if (!(e instanceof t))
            throw new TypeError("Cannot call a class as a function");
    }
    function dg(e, t) {
        for (var n = 0; n < t.length; n++) {
            var s = t[n];
            ((s.enumerable = s.enumerable || !1),
                (s.configurable = !0),
                "value" in s && (s.writable = !0),
                Object.defineProperty(e, s.key, s));
        }
    }
    function Je(e, t, n) {
        return (
            t && dg(e.prototype, t),
            Object.defineProperty(e, "prototype", { writable: !1 }),
            e
        );
    }
    function gs() {
        return (
            (gs =
                Object.assign ||
                function (e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var s in n)
                            Object.prototype.hasOwnProperty.call(n, s) &&
                                (e[s] = n[s]);
                    }
                    return e;
                }),
            gs.apply(this, arguments)
        );
    }
    function vt(e, t) {
        if (typeof t != "function" && t !== null)
            throw new TypeError(
                "Super expression must either be null or a function",
            );
        ((e.prototype = Object.create(t && t.prototype, {
            constructor: { value: e, writable: !0, configurable: !0 },
        })),
            Object.defineProperty(e, "prototype", { writable: !1 }),
            t && Ni(e, t));
    }
    function hr(e) {
        return (
            (hr = Object.setPrototypeOf
                ? Object.getPrototypeOf
                : function (n) {
                      return n.__proto__ || Object.getPrototypeOf(n);
                  }),
            hr(e)
        );
    }
    function Ni(e, t) {
        return (
            (Ni =
                Object.setPrototypeOf ||
                function (s, r) {
                    return ((s.__proto__ = r), s);
                }),
            Ni(e, t)
        );
    }
    function hg() {
        if (
            typeof Reflect > "u" ||
            !Reflect.construct ||
            Reflect.construct.sham
        )
            return !1;
        if (typeof Proxy == "function") return !0;
        try {
            return (
                Boolean.prototype.valueOf.call(
                    Reflect.construct(Boolean, [], function () {}),
                ),
                !0
            );
        } catch {
            return !1;
        }
    }
    function pg(e) {
        if (e === void 0)
            throw new ReferenceError(
                "this hasn't been initialised - super() hasn't been called",
            );
        return e;
    }
    function vg(e, t) {
        if (t && (typeof t == "object" || typeof t == "function")) return t;
        if (t !== void 0)
            throw new TypeError(
                "Derived constructors may only return object or undefined",
            );
        return pg(e);
    }
    function mt(e) {
        var t = hg();
        return function () {
            var s = hr(e),
                r;
            if (t) {
                var i = hr(this).constructor;
                r = Reflect.construct(s, arguments, i);
            } else r = s.apply(this, arguments);
            return vg(this, r);
        };
    }
    var Di = (function () {
            function e() {
                Ke(this, e);
            }
            return (
                Je(e, [
                    {
                        key: "listenForWhisper",
                        value: function (n, s) {
                            return this.listen(".client-" + n, s);
                        },
                    },
                    {
                        key: "notification",
                        value: function (n) {
                            return this.listen(
                                ".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
                                n,
                            );
                        },
                    },
                    {
                        key: "stopListeningForWhisper",
                        value: function (n, s) {
                            return this.stopListening(".client-" + n, s);
                        },
                    },
                ]),
                e
            );
        })(),
        Kc = (function () {
            function e(t) {
                (Ke(this, e), (this.namespace = t));
            }
            return (
                Je(e, [
                    {
                        key: "format",
                        value: function (n) {
                            return [".", "\\"].includes(n.charAt(0))
                                ? n.substring(1)
                                : (this.namespace &&
                                      (n = this.namespace + "." + n),
                                  n.replace(/\./g, "\\"));
                        },
                    },
                    {
                        key: "setNamespace",
                        value: function (n) {
                            this.namespace = n;
                        },
                    },
                ]),
                e
            );
        })();
    function mg(e) {
        try {
            new e();
        } catch (t) {
            if (t.message.includes("is not a constructor")) return !1;
        }
        return !0;
    }
    var ji = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n(s, r, i) {
                var a;
                return (
                    Ke(this, n),
                    (a = t.call(this)),
                    (a.name = r),
                    (a.pusher = s),
                    (a.options = i),
                    (a.eventFormatter = new Kc(a.options.namespace)),
                    a.subscribe(),
                    a
                );
            }
            return (
                Je(n, [
                    {
                        key: "subscribe",
                        value: function () {
                            this.subscription = this.pusher.subscribe(
                                this.name,
                            );
                        },
                    },
                    {
                        key: "unsubscribe",
                        value: function () {
                            this.pusher.unsubscribe(this.name);
                        },
                    },
                    {
                        key: "listen",
                        value: function (r, i) {
                            return (
                                this.on(this.eventFormatter.format(r), i),
                                this
                            );
                        },
                    },
                    {
                        key: "listenToAll",
                        value: function (r) {
                            var i = this;
                            return (
                                this.subscription.bind_global(function (a, c) {
                                    if (!a.startsWith("pusher:")) {
                                        var u = i.options.namespace.replace(
                                                /\./g,
                                                "\\",
                                            ),
                                            h = a.startsWith(u)
                                                ? a.substring(u.length + 1)
                                                : "." + a;
                                        r(h, c);
                                    }
                                }),
                                this
                            );
                        },
                    },
                    {
                        key: "stopListening",
                        value: function (r, i) {
                            return (
                                i
                                    ? this.subscription.unbind(
                                          this.eventFormatter.format(r),
                                          i,
                                      )
                                    : this.subscription.unbind(
                                          this.eventFormatter.format(r),
                                      ),
                                this
                            );
                        },
                    },
                    {
                        key: "stopListeningToAll",
                        value: function (r) {
                            return (
                                r
                                    ? this.subscription.unbind_global(r)
                                    : this.subscription.unbind_global(),
                                this
                            );
                        },
                    },
                    {
                        key: "subscribed",
                        value: function (r) {
                            return (
                                this.on(
                                    "pusher:subscription_succeeded",
                                    function () {
                                        r();
                                    },
                                ),
                                this
                            );
                        },
                    },
                    {
                        key: "error",
                        value: function (r) {
                            return (
                                this.on(
                                    "pusher:subscription_error",
                                    function (i) {
                                        r(i);
                                    },
                                ),
                                this
                            );
                        },
                    },
                    {
                        key: "on",
                        value: function (r, i) {
                            return (this.subscription.bind(r, i), this);
                        },
                    },
                ]),
                n
            );
        })(Di),
        Jc = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    {
                        key: "whisper",
                        value: function (r, i) {
                            return (
                                this.pusher.channels.channels[
                                    this.name
                                ].trigger("client-".concat(r), i),
                                this
                            );
                        },
                    },
                ]),
                n
            );
        })(ji),
        gg = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    {
                        key: "whisper",
                        value: function (r, i) {
                            return (
                                this.pusher.channels.channels[
                                    this.name
                                ].trigger("client-".concat(r), i),
                                this
                            );
                        },
                    },
                ]),
                n
            );
        })(ji),
        bg = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    {
                        key: "here",
                        value: function (r) {
                            return (
                                this.on(
                                    "pusher:subscription_succeeded",
                                    function (i) {
                                        r(
                                            Object.keys(i.members).map(
                                                function (a) {
                                                    return i.members[a];
                                                },
                                            ),
                                        );
                                    },
                                ),
                                this
                            );
                        },
                    },
                    {
                        key: "joining",
                        value: function (r) {
                            return (
                                this.on("pusher:member_added", function (i) {
                                    r(i.info);
                                }),
                                this
                            );
                        },
                    },
                    {
                        key: "whisper",
                        value: function (r, i) {
                            return (
                                this.pusher.channels.channels[
                                    this.name
                                ].trigger("client-".concat(r), i),
                                this
                            );
                        },
                    },
                    {
                        key: "leaving",
                        value: function (r) {
                            return (
                                this.on("pusher:member_removed", function (i) {
                                    r(i.info);
                                }),
                                this
                            );
                        },
                    },
                ]),
                n
            );
        })(Jc),
        Xc = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n(s, r, i) {
                var a;
                return (
                    Ke(this, n),
                    (a = t.call(this)),
                    (a.events = {}),
                    (a.listeners = {}),
                    (a.name = r),
                    (a.socket = s),
                    (a.options = i),
                    (a.eventFormatter = new Kc(a.options.namespace)),
                    a.subscribe(),
                    a
                );
            }
            return (
                Je(n, [
                    {
                        key: "subscribe",
                        value: function () {
                            this.socket.emit("subscribe", {
                                channel: this.name,
                                auth: this.options.auth || {},
                            });
                        },
                    },
                    {
                        key: "unsubscribe",
                        value: function () {
                            (this.unbind(),
                                this.socket.emit("unsubscribe", {
                                    channel: this.name,
                                    auth: this.options.auth || {},
                                }));
                        },
                    },
                    {
                        key: "listen",
                        value: function (r, i) {
                            return (
                                this.on(this.eventFormatter.format(r), i),
                                this
                            );
                        },
                    },
                    {
                        key: "stopListening",
                        value: function (r, i) {
                            return (
                                this.unbindEvent(
                                    this.eventFormatter.format(r),
                                    i,
                                ),
                                this
                            );
                        },
                    },
                    {
                        key: "subscribed",
                        value: function (r) {
                            return (
                                this.on("connect", function (i) {
                                    r(i);
                                }),
                                this
                            );
                        },
                    },
                    {
                        key: "error",
                        value: function (r) {
                            return this;
                        },
                    },
                    {
                        key: "on",
                        value: function (r, i) {
                            var a = this;
                            return (
                                (this.listeners[r] = this.listeners[r] || []),
                                this.events[r] ||
                                    ((this.events[r] = function (c, u) {
                                        a.name === c &&
                                            a.listeners[r] &&
                                            a.listeners[r].forEach(
                                                function (h) {
                                                    return h(u);
                                                },
                                            );
                                    }),
                                    this.socket.on(r, this.events[r])),
                                this.listeners[r].push(i),
                                this
                            );
                        },
                    },
                    {
                        key: "unbind",
                        value: function () {
                            var r = this;
                            Object.keys(this.events).forEach(function (i) {
                                r.unbindEvent(i);
                            });
                        },
                    },
                    {
                        key: "unbindEvent",
                        value: function (r, i) {
                            ((this.listeners[r] = this.listeners[r] || []),
                                i &&
                                    (this.listeners[r] = this.listeners[
                                        r
                                    ].filter(function (a) {
                                        return a !== i;
                                    })),
                                (!i || this.listeners[r].length === 0) &&
                                    (this.events[r] &&
                                        (this.socket.removeListener(
                                            r,
                                            this.events[r],
                                        ),
                                        delete this.events[r]),
                                    delete this.listeners[r]));
                        },
                    },
                ]),
                n
            );
        })(Di),
        Gc = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    {
                        key: "whisper",
                        value: function (r, i) {
                            return (
                                this.socket.emit("client event", {
                                    channel: this.name,
                                    event: "client-".concat(r),
                                    data: i,
                                }),
                                this
                            );
                        },
                    },
                ]),
                n
            );
        })(Xc),
        yg = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    {
                        key: "here",
                        value: function (r) {
                            return (
                                this.on("presence:subscribed", function (i) {
                                    r(
                                        i.map(function (a) {
                                            return a.user_info;
                                        }),
                                    );
                                }),
                                this
                            );
                        },
                    },
                    {
                        key: "joining",
                        value: function (r) {
                            return (
                                this.on("presence:joining", function (i) {
                                    return r(i.user_info);
                                }),
                                this
                            );
                        },
                    },
                    {
                        key: "whisper",
                        value: function (r, i) {
                            return (
                                this.socket.emit("client event", {
                                    channel: this.name,
                                    event: "client-".concat(r),
                                    data: i,
                                }),
                                this
                            );
                        },
                    },
                    {
                        key: "leaving",
                        value: function (r) {
                            return (
                                this.on("presence:leaving", function (i) {
                                    return r(i.user_info);
                                }),
                                this
                            );
                        },
                    },
                ]),
                n
            );
        })(Gc),
        pr = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    { key: "subscribe", value: function () {} },
                    { key: "unsubscribe", value: function () {} },
                    {
                        key: "listen",
                        value: function (r, i) {
                            return this;
                        },
                    },
                    {
                        key: "listenToAll",
                        value: function (r) {
                            return this;
                        },
                    },
                    {
                        key: "stopListening",
                        value: function (r, i) {
                            return this;
                        },
                    },
                    {
                        key: "subscribed",
                        value: function (r) {
                            return this;
                        },
                    },
                    {
                        key: "error",
                        value: function (r) {
                            return this;
                        },
                    },
                    {
                        key: "on",
                        value: function (r, i) {
                            return this;
                        },
                    },
                ]),
                n
            );
        })(Di),
        Zc = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    {
                        key: "whisper",
                        value: function (r, i) {
                            return this;
                        },
                    },
                ]),
                n
            );
        })(pr),
        _g = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    {
                        key: "whisper",
                        value: function (r, i) {
                            return this;
                        },
                    },
                ]),
                n
            );
        })(pr),
        wg = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                return (Ke(this, n), t.apply(this, arguments));
            }
            return (
                Je(n, [
                    {
                        key: "here",
                        value: function (r) {
                            return this;
                        },
                    },
                    {
                        key: "joining",
                        value: function (r) {
                            return this;
                        },
                    },
                    {
                        key: "whisper",
                        value: function (r, i) {
                            return this;
                        },
                    },
                    {
                        key: "leaving",
                        value: function (r) {
                            return this;
                        },
                    },
                ]),
                n
            );
        })(Zc),
        Ii = (function () {
            function e(t) {
                (Ke(this, e),
                    (this._defaultOptions = {
                        auth: { headers: {} },
                        authEndpoint: "/broadcasting/auth",
                        userAuthentication: {
                            endpoint: "/broadcasting/user-auth",
                            headers: {},
                        },
                        broadcaster: "pusher",
                        csrfToken: null,
                        bearerToken: null,
                        host: null,
                        key: null,
                        namespace: "App.Events",
                    }),
                    this.setOptions(t),
                    this.connect());
            }
            return (
                Je(e, [
                    {
                        key: "setOptions",
                        value: function (n) {
                            this.options = gs(this._defaultOptions, n);
                            var s = this.csrfToken();
                            return (
                                s &&
                                    ((this.options.auth.headers[
                                        "X-CSRF-TOKEN"
                                    ] = s),
                                    (this.options.userAuthentication.headers[
                                        "X-CSRF-TOKEN"
                                    ] = s)),
                                (s = this.options.bearerToken),
                                s &&
                                    ((this.options.auth.headers.Authorization =
                                        "Bearer " + s),
                                    (this.options.userAuthentication.headers.Authorization =
                                        "Bearer " + s)),
                                n
                            );
                        },
                    },
                    {
                        key: "csrfToken",
                        value: function () {
                            var n;
                            return typeof window < "u" &&
                                window.Laravel &&
                                window.Laravel.csrfToken
                                ? window.Laravel.csrfToken
                                : this.options.csrfToken
                                  ? this.options.csrfToken
                                  : typeof document < "u" &&
                                      typeof document.querySelector ==
                                          "function" &&
                                      (n = document.querySelector(
                                          'meta[name="csrf-token"]',
                                      ))
                                    ? n.getAttribute("content")
                                    : null;
                        },
                    },
                ]),
                e
            );
        })(),
        Qc = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                var s;
                return (
                    Ke(this, n),
                    (s = t.apply(this, arguments)),
                    (s.channels = {}),
                    s
                );
            }
            return (
                Je(n, [
                    {
                        key: "connect",
                        value: function () {
                            typeof this.options.client < "u"
                                ? (this.pusher = this.options.client)
                                : this.options.Pusher
                                  ? (this.pusher = new this.options.Pusher(
                                        this.options.key,
                                        this.options,
                                    ))
                                  : (this.pusher = new Pusher(
                                        this.options.key,
                                        this.options,
                                    ));
                        },
                    },
                    {
                        key: "signin",
                        value: function () {
                            this.pusher.signin();
                        },
                    },
                    {
                        key: "listen",
                        value: function (r, i, a) {
                            return this.channel(r).listen(i, a);
                        },
                    },
                    {
                        key: "channel",
                        value: function (r) {
                            return (
                                this.channels[r] ||
                                    (this.channels[r] = new ji(
                                        this.pusher,
                                        r,
                                        this.options,
                                    )),
                                this.channels[r]
                            );
                        },
                    },
                    {
                        key: "privateChannel",
                        value: function (r) {
                            return (
                                this.channels["private-" + r] ||
                                    (this.channels["private-" + r] = new Jc(
                                        this.pusher,
                                        "private-" + r,
                                        this.options,
                                    )),
                                this.channels["private-" + r]
                            );
                        },
                    },
                    {
                        key: "encryptedPrivateChannel",
                        value: function (r) {
                            return (
                                this.channels["private-encrypted-" + r] ||
                                    (this.channels["private-encrypted-" + r] =
                                        new gg(
                                            this.pusher,
                                            "private-encrypted-" + r,
                                            this.options,
                                        )),
                                this.channels["private-encrypted-" + r]
                            );
                        },
                    },
                    {
                        key: "presenceChannel",
                        value: function (r) {
                            return (
                                this.channels["presence-" + r] ||
                                    (this.channels["presence-" + r] = new bg(
                                        this.pusher,
                                        "presence-" + r,
                                        this.options,
                                    )),
                                this.channels["presence-" + r]
                            );
                        },
                    },
                    {
                        key: "leave",
                        value: function (r) {
                            var i = this,
                                a = [
                                    r,
                                    "private-" + r,
                                    "private-encrypted-" + r,
                                    "presence-" + r,
                                ];
                            a.forEach(function (c, u) {
                                i.leaveChannel(c);
                            });
                        },
                    },
                    {
                        key: "leaveChannel",
                        value: function (r) {
                            this.channels[r] &&
                                (this.channels[r].unsubscribe(),
                                delete this.channels[r]);
                        },
                    },
                    {
                        key: "socketId",
                        value: function () {
                            return this.pusher.connection.socket_id;
                        },
                    },
                    {
                        key: "disconnect",
                        value: function () {
                            this.pusher.disconnect();
                        },
                    },
                ]),
                n
            );
        })(Ii),
        Yc = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                var s;
                return (
                    Ke(this, n),
                    (s = t.apply(this, arguments)),
                    (s.channels = {}),
                    s
                );
            }
            return (
                Je(n, [
                    {
                        key: "connect",
                        value: function () {
                            var r = this,
                                i = this.getSocketIO();
                            return (
                                (this.socket = i(
                                    this.options.host,
                                    this.options,
                                )),
                                this.socket.on("reconnect", function () {
                                    Object.values(r.channels).forEach(
                                        function (a) {
                                            a.subscribe();
                                        },
                                    );
                                }),
                                this.socket
                            );
                        },
                    },
                    {
                        key: "getSocketIO",
                        value: function () {
                            if (typeof this.options.client < "u")
                                return this.options.client;
                            if (typeof io < "u") return io;
                            throw new Error(
                                "Socket.io client not found. Should be globally available or passed via options.client",
                            );
                        },
                    },
                    {
                        key: "listen",
                        value: function (r, i, a) {
                            return this.channel(r).listen(i, a);
                        },
                    },
                    {
                        key: "channel",
                        value: function (r) {
                            return (
                                this.channels[r] ||
                                    (this.channels[r] = new Xc(
                                        this.socket,
                                        r,
                                        this.options,
                                    )),
                                this.channels[r]
                            );
                        },
                    },
                    {
                        key: "privateChannel",
                        value: function (r) {
                            return (
                                this.channels["private-" + r] ||
                                    (this.channels["private-" + r] = new Gc(
                                        this.socket,
                                        "private-" + r,
                                        this.options,
                                    )),
                                this.channels["private-" + r]
                            );
                        },
                    },
                    {
                        key: "presenceChannel",
                        value: function (r) {
                            return (
                                this.channels["presence-" + r] ||
                                    (this.channels["presence-" + r] = new yg(
                                        this.socket,
                                        "presence-" + r,
                                        this.options,
                                    )),
                                this.channels["presence-" + r]
                            );
                        },
                    },
                    {
                        key: "leave",
                        value: function (r) {
                            var i = this,
                                a = [r, "private-" + r, "presence-" + r];
                            a.forEach(function (c) {
                                i.leaveChannel(c);
                            });
                        },
                    },
                    {
                        key: "leaveChannel",
                        value: function (r) {
                            this.channels[r] &&
                                (this.channels[r].unsubscribe(),
                                delete this.channels[r]);
                        },
                    },
                    {
                        key: "socketId",
                        value: function () {
                            return this.socket.id;
                        },
                    },
                    {
                        key: "disconnect",
                        value: function () {
                            this.socket.disconnect();
                        },
                    },
                ]),
                n
            );
        })(Ii),
        xg = (function (e) {
            vt(n, e);
            var t = mt(n);
            function n() {
                var s;
                return (
                    Ke(this, n),
                    (s = t.apply(this, arguments)),
                    (s.channels = {}),
                    s
                );
            }
            return (
                Je(n, [
                    { key: "connect", value: function () {} },
                    {
                        key: "listen",
                        value: function (r, i, a) {
                            return new pr();
                        },
                    },
                    {
                        key: "channel",
                        value: function (r) {
                            return new pr();
                        },
                    },
                    {
                        key: "privateChannel",
                        value: function (r) {
                            return new Zc();
                        },
                    },
                    {
                        key: "encryptedPrivateChannel",
                        value: function (r) {
                            return new _g();
                        },
                    },
                    {
                        key: "presenceChannel",
                        value: function (r) {
                            return new wg();
                        },
                    },
                    { key: "leave", value: function (r) {} },
                    { key: "leaveChannel", value: function (r) {} },
                    {
                        key: "socketId",
                        value: function () {
                            return "fake-socket-id";
                        },
                    },
                    { key: "disconnect", value: function () {} },
                ]),
                n
            );
        })(Ii),
        kg = (function () {
            function e(t) {
                (Ke(this, e),
                    (this.options = t),
                    this.connect(),
                    this.options.withoutInterceptors ||
                        this.registerInterceptors());
            }
            return (
                Je(e, [
                    {
                        key: "channel",
                        value: function (n) {
                            return this.connector.channel(n);
                        },
                    },
                    {
                        key: "connect",
                        value: function () {
                            if (this.options.broadcaster == "reverb")
                                this.connector = new Qc(
                                    gs(gs({}, this.options), { cluster: "" }),
                                );
                            else if (this.options.broadcaster == "pusher")
                                this.connector = new Qc(this.options);
                            else if (this.options.broadcaster == "socket.io")
                                this.connector = new Yc(this.options);
                            else if (this.options.broadcaster == "null")
                                this.connector = new xg(this.options);
                            else if (
                                typeof this.options.broadcaster == "function" &&
                                mg(this.options.broadcaster)
                            )
                                this.connector = new this.options.broadcaster(
                                    this.options,
                                );
                            else
                                throw new Error(
                                    "Broadcaster "
                                        .concat(
                                            ms(this.options.broadcaster),
                                            " ",
                                        )
                                        .concat(
                                            this.options.broadcaster,
                                            " is not supported.",
                                        ),
                                );
                        },
                    },
                    {
                        key: "disconnect",
                        value: function () {
                            this.connector.disconnect();
                        },
                    },
                    {
                        key: "join",
                        value: function (n) {
                            return this.connector.presenceChannel(n);
                        },
                    },
                    {
                        key: "leave",
                        value: function (n) {
                            this.connector.leave(n);
                        },
                    },
                    {
                        key: "leaveChannel",
                        value: function (n) {
                            this.connector.leaveChannel(n);
                        },
                    },
                    {
                        key: "leaveAllChannels",
                        value: function () {
                            for (var n in this.connector.channels)
                                this.leaveChannel(n);
                        },
                    },
                    {
                        key: "listen",
                        value: function (n, s, r) {
                            return this.connector.listen(n, s, r);
                        },
                    },
                    {
                        key: "private",
                        value: function (n) {
                            return this.connector.privateChannel(n);
                        },
                    },
                    {
                        key: "encryptedPrivate",
                        value: function (n) {
                            if (this.connector instanceof Yc)
                                throw new Error(
                                    "Broadcaster "
                                        .concat(
                                            ms(this.options.broadcaster),
                                            " ",
                                        )
                                        .concat(
                                            this.options.broadcaster,
                                            " does not support encrypted private channels.",
                                        ),
                                );
                            return this.connector.encryptedPrivateChannel(n);
                        },
                    },
                    {
                        key: "socketId",
                        value: function () {
                            return this.connector.socketId();
                        },
                    },
                    {
                        key: "registerInterceptors",
                        value: function () {
                            (typeof Vue == "function" &&
                                Vue.http &&
                                this.registerVueRequestInterceptor(),
                                typeof axios == "function" &&
                                    this.registerAxiosRequestInterceptor(),
                                typeof jQuery == "function" &&
                                    this.registerjQueryAjaxSetup(),
                                (typeof Turbo > "u"
                                    ? "undefined"
                                    : ms(Turbo)) === "object" &&
                                    this.registerTurboRequestInterceptor());
                        },
                    },
                    {
                        key: "registerVueRequestInterceptor",
                        value: function () {
                            var n = this;
                            Vue.http.interceptors.push(function (s, r) {
                                (n.socketId() &&
                                    s.headers.set("X-Socket-ID", n.socketId()),
                                    r());
                            });
                        },
                    },
                    {
                        key: "registerAxiosRequestInterceptor",
                        value: function () {
                            var n = this;
                            axios.interceptors.request.use(function (s) {
                                return (
                                    n.socketId() &&
                                        (s.headers["X-Socket-Id"] =
                                            n.socketId()),
                                    s
                                );
                            });
                        },
                    },
                    {
                        key: "registerjQueryAjaxSetup",
                        value: function () {
                            var n = this;
                            typeof jQuery.ajax < "u" &&
                                jQuery.ajaxPrefilter(function (s, r, i) {
                                    n.socketId() &&
                                        i.setRequestHeader(
                                            "X-Socket-Id",
                                            n.socketId(),
                                        );
                                });
                        },
                    },
                    {
                        key: "registerTurboRequestInterceptor",
                        value: function () {
                            var n = this;
                            document.addEventListener(
                                "turbo:before-fetch-request",
                                function (s) {
                                    s.detail.fetchOptions.headers[
                                        "X-Socket-Id"
                                    ] = n.socketId();
                                },
                            );
                        },
                    },
                ]),
                e
            );
        })();
    function Sg(e) {
        return e &&
            e.__esModule &&
            Object.prototype.hasOwnProperty.call(e, "default")
            ? e.default
            : e;
    }
    var el = { exports: {} };
    /*!
     * Pusher JavaScript Library v8.6.0
     * https://pusher.com/
     *
     * Copyright 2020, Pusher
     * Released under the MIT licence.
     */ (function (e, t) {
        (function (s, r) {
            e.exports = r();
        })(self, () =>
            (() => {
                var n = {
                        594(a, c) {
                            var u =
                                (this && this.__extends) ||
                                (function () {
                                    var m = function (g, b) {
                                        return (
                                            (m =
                                                Object.setPrototypeOf ||
                                                ({ __proto__: [] } instanceof
                                                    Array &&
                                                    function (L, B) {
                                                        L.__proto__ = B;
                                                    }) ||
                                                function (L, B) {
                                                    for (var J in B)
                                                        B.hasOwnProperty(J) &&
                                                            (L[J] = B[J]);
                                                }),
                                            m(g, b)
                                        );
                                    };
                                    return function (g, b) {
                                        m(g, b);
                                        function L() {
                                            this.constructor = g;
                                        }
                                        g.prototype =
                                            b === null
                                                ? Object.create(b)
                                                : ((L.prototype = b.prototype),
                                                  new L());
                                    };
                                })();
                            Object.defineProperty(c, "__esModule", {
                                value: !0,
                            });
                            var h = 256,
                                d = (function () {
                                    function m(g) {
                                        (g === void 0 && (g = "="),
                                            (this._paddingCharacter = g));
                                    }
                                    return (
                                        (m.prototype.encodedLength = function (
                                            g,
                                        ) {
                                            return this._paddingCharacter
                                                ? (((g + 2) / 3) * 4) | 0
                                                : ((g * 8 + 5) / 6) | 0;
                                        }),
                                        (m.prototype.encode = function (g) {
                                            for (
                                                var b = "", L = 0;
                                                L < g.length - 2;
                                                L += 3
                                            ) {
                                                var B =
                                                    (g[L] << 16) |
                                                    (g[L + 1] << 8) |
                                                    g[L + 2];
                                                ((b += this._encodeByte(
                                                    (B >>> (3 * 6)) & 63,
                                                )),
                                                    (b += this._encodeByte(
                                                        (B >>> (2 * 6)) & 63,
                                                    )),
                                                    (b += this._encodeByte(
                                                        (B >>> (1 * 6)) & 63,
                                                    )),
                                                    (b += this._encodeByte(
                                                        (B >>> (0 * 6)) & 63,
                                                    )));
                                            }
                                            var J = g.length - L;
                                            if (J > 0) {
                                                var B =
                                                    (g[L] << 16) |
                                                    (J === 2
                                                        ? g[L + 1] << 8
                                                        : 0);
                                                ((b += this._encodeByte(
                                                    (B >>> (3 * 6)) & 63,
                                                )),
                                                    (b += this._encodeByte(
                                                        (B >>> (2 * 6)) & 63,
                                                    )),
                                                    J === 2
                                                        ? (b +=
                                                              this._encodeByte(
                                                                  (B >>>
                                                                      (1 * 6)) &
                                                                      63,
                                                              ))
                                                        : (b +=
                                                              this
                                                                  ._paddingCharacter ||
                                                              ""),
                                                    (b +=
                                                        this
                                                            ._paddingCharacter ||
                                                        ""));
                                            }
                                            return b;
                                        }),
                                        (m.prototype.maxDecodedLength =
                                            function (g) {
                                                return this._paddingCharacter
                                                    ? ((g / 4) * 3) | 0
                                                    : ((g * 6 + 7) / 8) | 0;
                                            }),
                                        (m.prototype.decodedLength = function (
                                            g,
                                        ) {
                                            return this.maxDecodedLength(
                                                g.length -
                                                    this._getPaddingLength(g),
                                            );
                                        }),
                                        (m.prototype.decode = function (g) {
                                            if (g.length === 0)
                                                return new Uint8Array(0);
                                            for (
                                                var b =
                                                        this._getPaddingLength(
                                                            g,
                                                        ),
                                                    L = g.length - b,
                                                    B = new Uint8Array(
                                                        this.maxDecodedLength(
                                                            L,
                                                        ),
                                                    ),
                                                    J = 0,
                                                    oe = 0,
                                                    ie = 0,
                                                    z = 0,
                                                    Z = 0,
                                                    Q = 0,
                                                    K = 0;
                                                oe < L - 4;
                                                oe += 4
                                            )
                                                ((z = this._decodeChar(
                                                    g.charCodeAt(oe + 0),
                                                )),
                                                    (Z = this._decodeChar(
                                                        g.charCodeAt(oe + 1),
                                                    )),
                                                    (Q = this._decodeChar(
                                                        g.charCodeAt(oe + 2),
                                                    )),
                                                    (K = this._decodeChar(
                                                        g.charCodeAt(oe + 3),
                                                    )),
                                                    (B[J++] =
                                                        (z << 2) | (Z >>> 4)),
                                                    (B[J++] =
                                                        (Z << 4) | (Q >>> 2)),
                                                    (B[J++] = (Q << 6) | K),
                                                    (ie |= z & h),
                                                    (ie |= Z & h),
                                                    (ie |= Q & h),
                                                    (ie |= K & h));
                                            if (
                                                (oe < L - 1 &&
                                                    ((z = this._decodeChar(
                                                        g.charCodeAt(oe),
                                                    )),
                                                    (Z = this._decodeChar(
                                                        g.charCodeAt(oe + 1),
                                                    )),
                                                    (B[J++] =
                                                        (z << 2) | (Z >>> 4)),
                                                    (ie |= z & h),
                                                    (ie |= Z & h)),
                                                oe < L - 2 &&
                                                    ((Q = this._decodeChar(
                                                        g.charCodeAt(oe + 2),
                                                    )),
                                                    (B[J++] =
                                                        (Z << 4) | (Q >>> 2)),
                                                    (ie |= Q & h)),
                                                oe < L - 3 &&
                                                    ((K = this._decodeChar(
                                                        g.charCodeAt(oe + 3),
                                                    )),
                                                    (B[J++] = (Q << 6) | K),
                                                    (ie |= K & h)),
                                                ie !== 0)
                                            )
                                                throw new Error(
                                                    "Base64Coder: incorrect characters for decoding",
                                                );
                                            return B;
                                        }),
                                        (m.prototype._encodeByte = function (
                                            g,
                                        ) {
                                            var b = g;
                                            return (
                                                (b += 65),
                                                (b += ((25 - g) >>> 8) & 6),
                                                (b += ((51 - g) >>> 8) & -75),
                                                (b += ((61 - g) >>> 8) & -15),
                                                (b += ((62 - g) >>> 8) & 3),
                                                String.fromCharCode(b)
                                            );
                                        }),
                                        (m.prototype._decodeChar = function (
                                            g,
                                        ) {
                                            var b = h;
                                            return (
                                                (b +=
                                                    (((42 - g) & (g - 44)) >>>
                                                        8) &
                                                    (-h + g - 43 + 62)),
                                                (b +=
                                                    (((46 - g) & (g - 48)) >>>
                                                        8) &
                                                    (-h + g - 47 + 63)),
                                                (b +=
                                                    (((47 - g) & (g - 58)) >>>
                                                        8) &
                                                    (-h + g - 48 + 52)),
                                                (b +=
                                                    (((64 - g) & (g - 91)) >>>
                                                        8) &
                                                    (-h + g - 65 + 0)),
                                                (b +=
                                                    (((96 - g) & (g - 123)) >>>
                                                        8) &
                                                    (-h + g - 97 + 26)),
                                                b
                                            );
                                        }),
                                        (m.prototype._getPaddingLength =
                                            function (g) {
                                                var b = 0;
                                                if (this._paddingCharacter) {
                                                    for (
                                                        var L = g.length - 1;
                                                        L >= 0 &&
                                                        g[L] ===
                                                            this
                                                                ._paddingCharacter;
                                                        L--
                                                    )
                                                        b++;
                                                    if (g.length < 4 || b > 2)
                                                        throw new Error(
                                                            "Base64Coder: incorrect padding",
                                                        );
                                                }
                                                return b;
                                            }),
                                        m
                                    );
                                })();
                            c.Coder = d;
                            var v = new d();
                            function w(m) {
                                return v.encode(m);
                            }
                            c.encode = w;
                            function C(m) {
                                return v.decode(m);
                            }
                            c.decode = C;
                            var O = (function (m) {
                                u(g, m);
                                function g() {
                                    return (
                                        (m !== null &&
                                            m.apply(this, arguments)) ||
                                        this
                                    );
                                }
                                return (
                                    (g.prototype._encodeByte = function (b) {
                                        var L = b;
                                        return (
                                            (L += 65),
                                            (L += ((25 - b) >>> 8) & 6),
                                            (L += ((51 - b) >>> 8) & -75),
                                            (L += ((61 - b) >>> 8) & -13),
                                            (L += ((62 - b) >>> 8) & 49),
                                            String.fromCharCode(L)
                                        );
                                    }),
                                    (g.prototype._decodeChar = function (b) {
                                        var L = h;
                                        return (
                                            (L +=
                                                (((44 - b) & (b - 46)) >>> 8) &
                                                (-h + b - 45 + 62)),
                                            (L +=
                                                (((94 - b) & (b - 96)) >>> 8) &
                                                (-h + b - 95 + 63)),
                                            (L +=
                                                (((47 - b) & (b - 58)) >>> 8) &
                                                (-h + b - 48 + 52)),
                                            (L +=
                                                (((64 - b) & (b - 91)) >>> 8) &
                                                (-h + b - 65 + 0)),
                                            (L +=
                                                (((96 - b) & (b - 123)) >>> 8) &
                                                (-h + b - 97 + 26)),
                                            L
                                        );
                                    }),
                                    g
                                );
                            })(d);
                            c.URLSafeCoder = O;
                            var P = new O();
                            function A(m) {
                                return P.encode(m);
                            }
                            c.encodeURLSafe = A;
                            function T(m) {
                                return P.decode(m);
                            }
                            ((c.decodeURLSafe = T),
                                (c.encodedLength = function (m) {
                                    return v.encodedLength(m);
                                }),
                                (c.maxDecodedLength = function (m) {
                                    return v.maxDecodedLength(m);
                                }),
                                (c.decodedLength = function (m) {
                                    return v.decodedLength(m);
                                }));
                        },
                        978(a, c) {
                            var u = "utf8: invalid source encoding";
                            function h(d) {
                                for (var v = [], w = 0; w < d.length; w++) {
                                    var C = d[w];
                                    if (C & 128) {
                                        var O = void 0;
                                        if (C < 224) {
                                            if (w >= d.length)
                                                throw new Error(u);
                                            var P = d[++w];
                                            if ((P & 192) !== 128)
                                                throw new Error(u);
                                            ((C = ((C & 31) << 6) | (P & 63)),
                                                (O = 128));
                                        } else if (C < 240) {
                                            if (w >= d.length - 1)
                                                throw new Error(u);
                                            var P = d[++w],
                                                A = d[++w];
                                            if (
                                                (P & 192) !== 128 ||
                                                (A & 192) !== 128
                                            )
                                                throw new Error(u);
                                            ((C =
                                                ((C & 15) << 12) |
                                                ((P & 63) << 6) |
                                                (A & 63)),
                                                (O = 2048));
                                        } else if (C < 248) {
                                            if (w >= d.length - 2)
                                                throw new Error(u);
                                            var P = d[++w],
                                                A = d[++w],
                                                T = d[++w];
                                            if (
                                                (P & 192) !== 128 ||
                                                (A & 192) !== 128 ||
                                                (T & 192) !== 128
                                            )
                                                throw new Error(u);
                                            ((C =
                                                ((C & 15) << 18) |
                                                ((P & 63) << 12) |
                                                ((A & 63) << 6) |
                                                (T & 63)),
                                                (O = 65536));
                                        } else throw new Error(u);
                                        if (C < O || (C >= 55296 && C <= 57343))
                                            throw new Error(u);
                                        if (C >= 65536) {
                                            if (C > 1114111) throw new Error(u);
                                            ((C -= 65536),
                                                v.push(
                                                    String.fromCharCode(
                                                        55296 | (C >> 10),
                                                    ),
                                                ),
                                                (C = 56320 | (C & 1023)));
                                        }
                                    }
                                    v.push(String.fromCharCode(C));
                                }
                                return v.join("");
                            }
                            c.D4 = h;
                        },
                        721(a, c, u) {
                            a.exports = u(207).default;
                        },
                        207(a, c, u) {
                            u.d(c, { default: () => _r });
                            class h {
                                constructor(o, l) {
                                    ((this.lastId = 0),
                                        (this.prefix = o),
                                        (this.name = l));
                                }
                                create(o) {
                                    this.lastId++;
                                    var l = this.lastId,
                                        p = this.prefix + l,
                                        _ = this.name + "[" + l + "]",
                                        N = !1,
                                        q = function () {
                                            N ||
                                                (o.apply(null, arguments),
                                                (N = !0));
                                        };
                                    return (
                                        (this[l] = q),
                                        {
                                            number: l,
                                            id: p,
                                            name: _,
                                            callback: q,
                                        }
                                    );
                                }
                                remove(o) {
                                    delete this[o.number];
                                }
                            }
                            var d = new h(
                                    "_pusher_script_",
                                    "Pusher.ScriptReceivers",
                                ),
                                v = {
                                    VERSION: "8.6.0",
                                    PROTOCOL: 7,
                                    wsPort: 80,
                                    wssPort: 443,
                                    wsPath: "",
                                    httpHost: "sockjs.pusher.com",
                                    httpPort: 80,
                                    httpsPort: 443,
                                    httpPath: "/pusher",
                                    stats_host: "stats.pusher.com",
                                    authEndpoint: "/pusher/auth",
                                    authTransport: "ajax",
                                    activityTimeout: 12e4,
                                    pongTimeout: 3e4,
                                    unavailableTimeout: 1e4,
                                    userAuthentication: {
                                        endpoint: "/pusher/user-auth",
                                        transport: "ajax",
                                    },
                                    channelAuthorization: {
                                        endpoint: "/pusher/auth",
                                        transport: "ajax",
                                    },
                                    cdn_http: "http://js.pusher.com",
                                    cdn_https: "https://js.pusher.com",
                                    dependency_suffix: "",
                                };
                            const w = v;
                            class C {
                                constructor(o) {
                                    ((this.options = o),
                                        (this.receivers = o.receivers || d),
                                        (this.loading = {}));
                                }
                                load(o, l, p) {
                                    var _ = this;
                                    if (_.loading[o] && _.loading[o].length > 0)
                                        _.loading[o].push(p);
                                    else {
                                        _.loading[o] = [p];
                                        var N = me.createScriptRequest(
                                                _.getPath(o, l),
                                            ),
                                            q = _.receivers.create(
                                                function (Y) {
                                                    if (
                                                        (_.receivers.remove(q),
                                                        _.loading[o])
                                                    ) {
                                                        var pe = _.loading[o];
                                                        delete _.loading[o];
                                                        for (
                                                            var Te = function (
                                                                    Ve,
                                                                ) {
                                                                    Ve ||
                                                                        N.cleanup();
                                                                },
                                                                Ae = 0;
                                                            Ae < pe.length;
                                                            Ae++
                                                        )
                                                            pe[Ae](Y, Te);
                                                    }
                                                },
                                            );
                                        N.send(q);
                                    }
                                }
                                getRoot(o) {
                                    var l,
                                        p = me.getDocument().location.protocol;
                                    return (
                                        (o && o.useTLS) || p === "https:"
                                            ? (l = this.options.cdn_https)
                                            : (l = this.options.cdn_http),
                                        l.replace(/\/*$/, "") +
                                            "/" +
                                            this.options.version
                                    );
                                }
                                getPath(o, l) {
                                    return (
                                        this.getRoot(l) +
                                        "/" +
                                        o +
                                        this.options.suffix +
                                        ".js"
                                    );
                                }
                            }
                            var O = new h(
                                    "_pusher_dependencies",
                                    "Pusher.DependenciesReceivers",
                                ),
                                P = new C({
                                    cdn_http: w.cdn_http,
                                    cdn_https: w.cdn_https,
                                    version: w.VERSION,
                                    suffix: w.dependency_suffix,
                                    receivers: O,
                                });
                            const A = {
                                    baseUrl: "https://pusher.com",
                                    urls: {
                                        authenticationEndpoint: {
                                            path: "/docs/channels/server_api/authenticating_users",
                                        },
                                        authorizationEndpoint: {
                                            path: "/docs/channels/server_api/authorizing-users/",
                                        },
                                        javascriptQuickStart: {
                                            path: "/docs/javascript_quick_start",
                                        },
                                        triggeringClientEvents: {
                                            path: "/docs/client_api_guide/client_events#trigger-events",
                                        },
                                        encryptedChannelSupport: {
                                            fullUrl:
                                                "https://github.com/pusher/pusher-js/tree/cc491015371a4bde5743d1c87a0fbac0feb53195#encrypted-channel-support",
                                        },
                                    },
                                },
                                m = {
                                    buildLogSuffix: function (f) {
                                        const o = "See:",
                                            l = A.urls[f];
                                        if (!l) return "";
                                        let p;
                                        return (
                                            l.fullUrl
                                                ? (p = l.fullUrl)
                                                : l.path &&
                                                  (p = A.baseUrl + l.path),
                                            p ? `${o} ${p}` : ""
                                        );
                                    },
                                };
                            var g;
                            (function (f) {
                                ((f.UserAuthentication = "user-authentication"),
                                    (f.ChannelAuthorization =
                                        "channel-authorization"));
                            })(g || (g = {}));
                            class b extends Error {
                                constructor(o) {
                                    (super(o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            class L extends Error {
                                constructor(o) {
                                    (super(o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            class B extends Error {
                                constructor(o) {
                                    (super(o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            class J extends Error {
                                constructor(o) {
                                    (super(o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            class oe extends Error {
                                constructor(o) {
                                    (super(o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            class ie extends Error {
                                constructor(o) {
                                    (super(o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            class z extends Error {
                                constructor(o) {
                                    (super(o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            class Z extends Error {
                                constructor(o) {
                                    (super(o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            class Q extends Error {
                                constructor(o, l) {
                                    (super(l),
                                        (this.status = o),
                                        Object.setPrototypeOf(
                                            this,
                                            new.target.prototype,
                                        ));
                                }
                            }
                            const ne = function (f, o, l, p, _) {
                                const N = me.createXHR();
                                (N.open("POST", l.endpoint, !0),
                                    N.setRequestHeader(
                                        "Content-Type",
                                        "application/x-www-form-urlencoded",
                                    ));
                                for (var q in l.headers)
                                    N.setRequestHeader(q, l.headers[q]);
                                if (l.headersProvider != null) {
                                    let Y = l.headersProvider();
                                    for (var q in Y)
                                        N.setRequestHeader(q, Y[q]);
                                }
                                return (
                                    (N.onreadystatechange = function () {
                                        if (N.readyState === 4)
                                            if (N.status === 200) {
                                                let Y,
                                                    pe = !1;
                                                try {
                                                    ((Y = JSON.parse(
                                                        N.responseText,
                                                    )),
                                                        (pe = !0));
                                                } catch {
                                                    _(
                                                        new Q(
                                                            200,
                                                            `JSON returned from ${p.toString()} endpoint was invalid, yet status code was 200. Data was: ${N.responseText}`,
                                                        ),
                                                        null,
                                                    );
                                                }
                                                pe && _(null, Y);
                                            } else {
                                                let Y = "";
                                                switch (p) {
                                                    case g.UserAuthentication:
                                                        Y = m.buildLogSuffix(
                                                            "authenticationEndpoint",
                                                        );
                                                        break;
                                                    case g.ChannelAuthorization:
                                                        Y = `Clients must be authorized to join private or presence channels. ${m.buildLogSuffix("authorizationEndpoint")}`;
                                                        break;
                                                }
                                                _(
                                                    new Q(
                                                        N.status,
                                                        `Unable to retrieve auth string from ${p.toString()} endpoint - received status: ${N.status} from ${l.endpoint}. ${Y}`,
                                                    ),
                                                    null,
                                                );
                                            }
                                    }),
                                    N.send(o),
                                    N
                                );
                            };
                            function et(f) {
                                return fe(se(f));
                            }
                            var Oe = String.fromCharCode,
                                _e =
                                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
                                Se = function (f) {
                                    var o = f.charCodeAt(0);
                                    return o < 128
                                        ? f
                                        : o < 2048
                                          ? Oe(192 | (o >>> 6)) +
                                            Oe(128 | (o & 63))
                                          : Oe(224 | ((o >>> 12) & 15)) +
                                            Oe(128 | ((o >>> 6) & 63)) +
                                            Oe(128 | (o & 63));
                                },
                                se = function (f) {
                                    return f.replace(/[^\x00-\x7F]/g, Se);
                                },
                                ae = function (f) {
                                    var o = [0, 2, 1][f.length % 3],
                                        l =
                                            (f.charCodeAt(0) << 16) |
                                            ((f.length > 1
                                                ? f.charCodeAt(1)
                                                : 0) <<
                                                8) |
                                            (f.length > 2
                                                ? f.charCodeAt(2)
                                                : 0),
                                        p = [
                                            _e.charAt(l >>> 18),
                                            _e.charAt((l >>> 12) & 63),
                                            o >= 2
                                                ? "="
                                                : _e.charAt((l >>> 6) & 63),
                                            o >= 1 ? "=" : _e.charAt(l & 63),
                                        ];
                                    return p.join("");
                                },
                                fe =
                                    (typeof window < "u" && window.btoa) ||
                                    function (f) {
                                        return f.replace(/[\s\S]{1,3}/g, ae);
                                    };
                            class Ne {
                                constructor(o, l, p, _) {
                                    ((this.clear = l),
                                        (this.timer = o(() => {
                                            this.timer &&
                                                (this.timer = _(this.timer));
                                        }, p)));
                                }
                                isRunning() {
                                    return this.timer !== null;
                                }
                                ensureAborted() {
                                    this.timer &&
                                        (this.clear(this.timer),
                                        (this.timer = null));
                                }
                            }
                            const ft = Ne;
                            function wt(f) {
                                window.clearTimeout(f);
                            }
                            function Re(f) {
                                window.clearInterval(f);
                            }
                            class le extends ft {
                                constructor(o, l) {
                                    super(setTimeout, wt, o, function (p) {
                                        return (l(), null);
                                    });
                                }
                            }
                            class ze extends ft {
                                constructor(o, l) {
                                    super(setInterval, Re, o, function (p) {
                                        return (l(), p);
                                    });
                                }
                            }
                            var Ft = {
                                now() {
                                    return Date.now
                                        ? Date.now()
                                        : new Date().valueOf();
                                },
                                defer(f) {
                                    return new le(0, f);
                                },
                                method(f, ...o) {
                                    var l = Array.prototype.slice.call(
                                        arguments,
                                        1,
                                    );
                                    return function (p) {
                                        return p[f].apply(
                                            p,
                                            l.concat(arguments),
                                        );
                                    };
                                },
                            };
                            const Fe = Ft;
                            function He(f, ...o) {
                                for (var l = 0; l < o.length; l++) {
                                    var p = o[l];
                                    for (var _ in p)
                                        _ === "__proto__" ||
                                            _ === "constructor" ||
                                            _ === "prototype" ||
                                            (p[_] &&
                                            p[_].constructor &&
                                            p[_].constructor === Object
                                                ? (f[_] = He(f[_] || {}, p[_]))
                                                : (f[_] = p[_]));
                                }
                                return f;
                            }
                            function ys() {
                                for (
                                    var f = ["Pusher"], o = 0;
                                    o < arguments.length;
                                    o++
                                )
                                    typeof arguments[o] == "string"
                                        ? f.push(arguments[o])
                                        : f.push(Ce(arguments[o]));
                                return f.join(" : ");
                            }
                            function y(f, o) {
                                var l = Array.prototype.indexOf;
                                if (f === null) return -1;
                                if (l && f.indexOf === l) return f.indexOf(o);
                                for (var p = 0, _ = f.length; p < _; p++)
                                    if (f[p] === o) return p;
                                return -1;
                            }
                            function x(f, o) {
                                for (var l in f)
                                    Object.prototype.hasOwnProperty.call(
                                        f,
                                        l,
                                    ) && o(f[l], l, f);
                            }
                            function M(f) {
                                var o = [];
                                return (
                                    x(f, function (l, p) {
                                        o.push(p);
                                    }),
                                    o
                                );
                            }
                            function j(f) {
                                var o = [];
                                return (
                                    x(f, function (l) {
                                        o.push(l);
                                    }),
                                    o
                                );
                            }
                            function R(f, o, l) {
                                for (var p = 0; p < f.length; p++)
                                    o.call(l || window, f[p], p, f);
                            }
                            function D(f, o) {
                                for (var l = [], p = 0; p < f.length; p++)
                                    l.push(o(f[p], p, f, l));
                                return l;
                            }
                            function H(f, o) {
                                var l = {};
                                return (
                                    x(f, function (p, _) {
                                        l[_] = o(p);
                                    }),
                                    l
                                );
                            }
                            function U(f, o) {
                                o =
                                    o ||
                                    function (_) {
                                        return !!_;
                                    };
                                for (var l = [], p = 0; p < f.length; p++)
                                    o(f[p], p, f, l) && l.push(f[p]);
                                return l;
                            }
                            function F(f, o) {
                                var l = {};
                                return (
                                    x(f, function (p, _) {
                                        ((o && o(p, _, f, l)) || p) &&
                                            (l[_] = p);
                                    }),
                                    l
                                );
                            }
                            function I(f) {
                                var o = [];
                                return (
                                    x(f, function (l, p) {
                                        o.push([p, l]);
                                    }),
                                    o
                                );
                            }
                            function te(f, o) {
                                for (var l = 0; l < f.length; l++)
                                    if (o(f[l], l, f)) return !0;
                                return !1;
                            }
                            function W(f, o) {
                                for (var l = 0; l < f.length; l++)
                                    if (!o(f[l], l, f)) return !1;
                                return !0;
                            }
                            function re(f) {
                                return H(f, function (o) {
                                    return o === null
                                        ? ""
                                        : (typeof o == "object" && (o = Ce(o)),
                                          encodeURIComponent(et(o.toString())));
                                });
                            }
                            function ce(f) {
                                var o = F(f, function (p) {
                                        return p !== void 0;
                                    }),
                                    l = D(
                                        I(re(o)),
                                        Fe.method("join", "="),
                                    ).join("&");
                                return l;
                            }
                            function ye(f) {
                                var o = [],
                                    l = [];
                                return (function p(_, N) {
                                    var q, Y, pe;
                                    switch (typeof _) {
                                        case "object":
                                            if (!_) return null;
                                            for (q = 0; q < o.length; q += 1)
                                                if (o[q] === _)
                                                    return { $ref: l[q] };
                                            if (
                                                (o.push(_),
                                                l.push(N),
                                                Object.prototype.toString.apply(
                                                    _,
                                                ) === "[object Array]")
                                            )
                                                for (
                                                    pe = [], q = 0;
                                                    q < _.length;
                                                    q += 1
                                                )
                                                    pe[q] = p(
                                                        _[q],
                                                        N + "[" + q + "]",
                                                    );
                                            else {
                                                pe = {};
                                                for (Y in _)
                                                    Object.prototype.hasOwnProperty.call(
                                                        _,
                                                        Y,
                                                    ) &&
                                                        (pe[Y] = p(
                                                            _[Y],
                                                            N +
                                                                "[" +
                                                                JSON.stringify(
                                                                    Y,
                                                                ) +
                                                                "]",
                                                        ));
                                            }
                                            return pe;
                                        case "number":
                                        case "string":
                                        case "boolean":
                                            return _;
                                    }
                                })(f, "$");
                            }
                            function Ce(f) {
                                try {
                                    return JSON.stringify(f);
                                } catch {
                                    return JSON.stringify(ye(f));
                                }
                            }
                            class Pe {
                                constructor() {
                                    this.globalLog = (o) => {
                                        window.console &&
                                            window.console.log &&
                                            window.console.log(o);
                                    };
                                }
                                debug(...o) {
                                    this.log(this.globalLog, o);
                                }
                                warn(...o) {
                                    this.log(this.globalLogWarn, o);
                                }
                                error(...o) {
                                    this.log(this.globalLogError, o);
                                }
                                globalLogWarn(o) {
                                    window.console && window.console.warn
                                        ? window.console.warn(o)
                                        : this.globalLog(o);
                                }
                                globalLogError(o) {
                                    window.console && window.console.error
                                        ? window.console.error(o)
                                        : this.globalLogWarn(o);
                                }
                                log(o, ...l) {
                                    var p = ys.apply(this, arguments);
                                    _r.log
                                        ? _r.log(p)
                                        : _r.logToConsole && o.bind(this)(p);
                                }
                            }
                            const de = new Pe();
                            var We = function (f, o, l, p, _) {
                                (l.headers !== void 0 ||
                                    l.headersProvider != null) &&
                                    de.warn(
                                        `To send headers with the ${p.toString()} request, you must use AJAX, rather than JSONP.`,
                                    );
                                var N = f.nextAuthCallbackID.toString();
                                f.nextAuthCallbackID++;
                                var q = f.getDocument(),
                                    Y = q.createElement("script");
                                f.auth_callbacks[N] = function (Ae) {
                                    _(null, Ae);
                                };
                                var pe = "Pusher.auth_callbacks['" + N + "']";
                                Y.src =
                                    l.endpoint +
                                    "?callback=" +
                                    encodeURIComponent(pe) +
                                    "&" +
                                    o;
                                var Te =
                                    q.getElementsByTagName("head")[0] ||
                                    q.documentElement;
                                Te.insertBefore(Y, Te.firstChild);
                            };
                            const xt = We;
                            class kt {
                                constructor(o) {
                                    this.src = o;
                                }
                                send(o) {
                                    var l = this,
                                        p = "Error loading " + l.src;
                                    ((l.script =
                                        document.createElement("script")),
                                        (l.script.id = o.id),
                                        (l.script.src = l.src),
                                        (l.script.type = "text/javascript"),
                                        (l.script.charset = "UTF-8"),
                                        l.script.addEventListener
                                            ? ((l.script.onerror = function () {
                                                  o.callback(p);
                                              }),
                                              (l.script.onload = function () {
                                                  o.callback(null);
                                              }))
                                            : (l.script.onreadystatechange =
                                                  function () {
                                                      (l.script.readyState ===
                                                          "loaded" ||
                                                          l.script
                                                              .readyState ===
                                                              "complete") &&
                                                          o.callback(null);
                                                  }),
                                        l.script.async === void 0 &&
                                        document.attachEvent &&
                                        /opera/i.test(navigator.userAgent)
                                            ? ((l.errorScript =
                                                  document.createElement(
                                                      "script",
                                                  )),
                                              (l.errorScript.id =
                                                  o.id + "_error"),
                                              (l.errorScript.text =
                                                  o.name + "('" + p + "');"),
                                              (l.script.async =
                                                  l.errorScript.async =
                                                      !1))
                                            : (l.script.async = !0));
                                    var _ =
                                        document.getElementsByTagName(
                                            "head",
                                        )[0];
                                    (_.insertBefore(l.script, _.firstChild),
                                        l.errorScript &&
                                            _.insertBefore(
                                                l.errorScript,
                                                l.script.nextSibling,
                                            ));
                                }
                                cleanup() {
                                    (this.script &&
                                        ((this.script.onload =
                                            this.script.onerror =
                                                null),
                                        (this.script.onreadystatechange =
                                            null)),
                                        this.script &&
                                            this.script.parentNode &&
                                            this.script.parentNode.removeChild(
                                                this.script,
                                            ),
                                        this.errorScript &&
                                            this.errorScript.parentNode &&
                                            this.errorScript.parentNode.removeChild(
                                                this.errorScript,
                                            ),
                                        (this.script = null),
                                        (this.errorScript = null));
                                }
                            }
                            class _n {
                                constructor(o, l) {
                                    ((this.url = o), (this.data = l));
                                }
                                send(o) {
                                    if (!this.request) {
                                        var l = ce(this.data),
                                            p =
                                                this.url +
                                                "/" +
                                                o.number +
                                                "?" +
                                                l;
                                        ((this.request =
                                            me.createScriptRequest(p)),
                                            this.request.send(o));
                                    }
                                }
                                cleanup() {
                                    this.request && this.request.cleanup();
                                }
                            }
                            var mr = function (f, o) {
                                    return function (l, p) {
                                        var _ = "http" + (o ? "s" : "") + "://",
                                            N =
                                                _ +
                                                (f.host || f.options.host) +
                                                f.options.path,
                                            q = me.createJSONPRequest(N, l),
                                            Y = me.ScriptReceivers.create(
                                                function (pe, Te) {
                                                    (d.remove(Y),
                                                        q.cleanup(),
                                                        Te &&
                                                            Te.host &&
                                                            (f.host = Te.host),
                                                        p && p(pe, Te));
                                                },
                                            );
                                        q.send(Y);
                                    };
                                },
                                dt = { name: "jsonp", getAgent: mr };
                            const St = dt;
                            function Hn(f, o, l) {
                                var p = f + (o.useTLS ? "s" : ""),
                                    _ = o.useTLS ? o.hostTLS : o.hostNonTLS;
                                return p + "://" + _ + l;
                            }
                            function qn(f, o) {
                                var l = "/app/" + f,
                                    p =
                                        "?protocol=" +
                                        w.PROTOCOL +
                                        "&client=js&version=" +
                                        w.VERSION +
                                        (o ? "&" + o : "");
                                return l + p;
                            }
                            var Hb = {
                                    getInitial: function (f, o) {
                                        var l =
                                            (o.httpPath || "") +
                                            qn(f, "flash=false");
                                        return Hn("ws", o, l);
                                    },
                                },
                                qb = {
                                    getInitial: function (f, o) {
                                        var l =
                                            (o.httpPath || "/pusher") + qn(f);
                                        return Hn("http", o, l);
                                    },
                                },
                                zb = {
                                    getInitial: function (f, o) {
                                        return Hn(
                                            "http",
                                            o,
                                            o.httpPath || "/pusher",
                                        );
                                    },
                                    getPath: function (f, o) {
                                        return qn(f);
                                    },
                                };
                            class Vb {
                                constructor() {
                                    this._callbacks = {};
                                }
                                get(o) {
                                    return this._callbacks[Bi(o)];
                                }
                                add(o, l, p) {
                                    var _ = Bi(o);
                                    ((this._callbacks[_] =
                                        this._callbacks[_] || []),
                                        this._callbacks[_].push({
                                            fn: l,
                                            context: p,
                                        }));
                                }
                                remove(o, l, p) {
                                    if (!o && !l && !p) {
                                        this._callbacks = {};
                                        return;
                                    }
                                    var _ = o ? [Bi(o)] : M(this._callbacks);
                                    l || p
                                        ? this.removeCallback(_, l, p)
                                        : this.removeAllCallbacks(_);
                                }
                                removeCallback(o, l, p) {
                                    R(
                                        o,
                                        function (_) {
                                            ((this._callbacks[_] = U(
                                                this._callbacks[_] || [],
                                                function (N) {
                                                    return (
                                                        (l && l !== N.fn) ||
                                                        (p && p !== N.context)
                                                    );
                                                },
                                            )),
                                                this._callbacks[_].length ===
                                                    0 &&
                                                    delete this._callbacks[_]);
                                        },
                                        this,
                                    );
                                }
                                removeAllCallbacks(o) {
                                    R(
                                        o,
                                        function (l) {
                                            delete this._callbacks[l];
                                        },
                                        this,
                                    );
                                }
                            }
                            function Bi(f) {
                                return "_" + f;
                            }
                            class nn {
                                constructor(o) {
                                    ((this.callbacks = new Vb()),
                                        (this.global_callbacks = []),
                                        (this.failThrough = o));
                                }
                                bind(o, l, p) {
                                    return (this.callbacks.add(o, l, p), this);
                                }
                                bind_global(o) {
                                    return (
                                        this.global_callbacks.push(o),
                                        this
                                    );
                                }
                                unbind(o, l, p) {
                                    return (
                                        this.callbacks.remove(o, l, p),
                                        this
                                    );
                                }
                                unbind_global(o) {
                                    return o
                                        ? ((this.global_callbacks = U(
                                              this.global_callbacks || [],
                                              (l) => l !== o,
                                          )),
                                          this)
                                        : ((this.global_callbacks = []), this);
                                }
                                unbind_all() {
                                    return (
                                        this.unbind(),
                                        this.unbind_global(),
                                        this
                                    );
                                }
                                emit(o, l, p) {
                                    for (
                                        var _ = 0;
                                        _ < this.global_callbacks.length;
                                        _++
                                    )
                                        this.global_callbacks[_](o, l);
                                    var N = this.callbacks.get(o),
                                        q = [];
                                    if (
                                        (p ? q.push(l, p) : l && q.push(l),
                                        N && N.length > 0)
                                    )
                                        for (var _ = 0; _ < N.length; _++)
                                            N[_].fn.apply(
                                                N[_].context || window,
                                                q,
                                            );
                                    else
                                        this.failThrough &&
                                            this.failThrough(o, l);
                                    return this;
                                }
                            }
                            class Wb extends nn {
                                constructor(o, l, p, _, N) {
                                    (super(),
                                        (this.initialize =
                                            me.transportConnectionInitializer),
                                        (this.hooks = o),
                                        (this.name = l),
                                        (this.priority = p),
                                        (this.key = _),
                                        (this.options = N),
                                        (this.state = "new"),
                                        (this.timeline = N.timeline),
                                        (this.activityTimeout =
                                            N.activityTimeout),
                                        (this.id =
                                            this.timeline.generateUniqueID()));
                                }
                                handlesActivityChecks() {
                                    return !!this.hooks.handlesActivityChecks;
                                }
                                supportsPing() {
                                    return !!this.hooks.supportsPing;
                                }
                                connect() {
                                    if (
                                        this.socket ||
                                        this.state !== "initialized"
                                    )
                                        return !1;
                                    var o = this.hooks.urls.getInitial(
                                        this.key,
                                        this.options,
                                    );
                                    try {
                                        this.socket = this.hooks.getSocket(
                                            o,
                                            this.options,
                                        );
                                    } catch (l) {
                                        return (
                                            Fe.defer(() => {
                                                (this.onError(l),
                                                    this.changeState("closed"));
                                            }),
                                            !1
                                        );
                                    }
                                    return (
                                        this.bindListeners(),
                                        de.debug("Connecting", {
                                            transport: this.name,
                                            url: o,
                                        }),
                                        this.changeState("connecting"),
                                        !0
                                    );
                                }
                                close() {
                                    return this.socket
                                        ? (this.socket.close(), !0)
                                        : !1;
                                }
                                send(o) {
                                    return this.state === "open"
                                        ? (Fe.defer(() => {
                                              this.socket &&
                                                  this.socket.send(o);
                                          }),
                                          !0)
                                        : !1;
                                }
                                ping() {
                                    this.state === "open" &&
                                        this.supportsPing() &&
                                        this.socket.ping();
                                }
                                onOpen() {
                                    (this.hooks.beforeOpen &&
                                        this.hooks.beforeOpen(
                                            this.socket,
                                            this.hooks.urls.getPath(
                                                this.key,
                                                this.options,
                                            ),
                                        ),
                                        this.changeState("open"),
                                        (this.socket.onopen = void 0));
                                }
                                onError(o) {
                                    (this.emit("error", {
                                        type: "WebSocketError",
                                        error: o,
                                    }),
                                        this.timeline.error(
                                            this.buildTimelineMessage({
                                                error: o.toString(),
                                            }),
                                        ));
                                }
                                onClose(o) {
                                    (o
                                        ? this.changeState("closed", {
                                              code: o.code,
                                              reason: o.reason,
                                              wasClean: o.wasClean,
                                          })
                                        : this.changeState("closed"),
                                        this.unbindListeners(),
                                        (this.socket = void 0));
                                }
                                onMessage(o) {
                                    this.emit("message", o);
                                }
                                onActivity() {
                                    this.emit("activity");
                                }
                                bindListeners() {
                                    ((this.socket.onopen = () => {
                                        this.onOpen();
                                    }),
                                        (this.socket.onerror = (o) => {
                                            this.onError(o);
                                        }),
                                        (this.socket.onclose = (o) => {
                                            this.onClose(o);
                                        }),
                                        (this.socket.onmessage = (o) => {
                                            this.onMessage(o);
                                        }),
                                        this.supportsPing() &&
                                            (this.socket.onactivity = () => {
                                                this.onActivity();
                                            }));
                                }
                                unbindListeners() {
                                    this.socket &&
                                        ((this.socket.onopen = void 0),
                                        (this.socket.onerror = void 0),
                                        (this.socket.onclose = void 0),
                                        (this.socket.onmessage = void 0),
                                        this.supportsPing() &&
                                            (this.socket.onactivity = void 0));
                                }
                                changeState(o, l) {
                                    ((this.state = o),
                                        this.timeline.info(
                                            this.buildTimelineMessage({
                                                state: o,
                                                params: l,
                                            }),
                                        ),
                                        this.emit(o, l));
                                }
                                buildTimelineMessage(o) {
                                    return He({ cid: this.id }, o);
                                }
                            }
                            class zn {
                                constructor(o) {
                                    this.hooks = o;
                                }
                                isSupported(o) {
                                    return this.hooks.isSupported(o);
                                }
                                createConnection(o, l, p, _) {
                                    return new Wb(this.hooks, o, l, p, _);
                                }
                            }
                            var Kb = new zn({
                                    urls: Hb,
                                    handlesActivityChecks: !1,
                                    supportsPing: !1,
                                    isInitialized: function () {
                                        return !!me.getWebSocketAPI();
                                    },
                                    isSupported: function () {
                                        return !!me.getWebSocketAPI();
                                    },
                                    getSocket: function (f) {
                                        return me.createWebSocket(f);
                                    },
                                }),
                                ol = {
                                    urls: qb,
                                    handlesActivityChecks: !1,
                                    supportsPing: !0,
                                    isInitialized: function () {
                                        return !0;
                                    },
                                },
                                al = He(
                                    {
                                        getSocket: function (f) {
                                            return me.HTTPFactory.createStreamingSocket(
                                                f,
                                            );
                                        },
                                    },
                                    ol,
                                ),
                                cl = He(
                                    {
                                        getSocket: function (f) {
                                            return me.HTTPFactory.createPollingSocket(
                                                f,
                                            );
                                        },
                                    },
                                    ol,
                                ),
                                ll = {
                                    isSupported: function () {
                                        return me.isXHRSupported();
                                    },
                                },
                                Jb = new zn(He({}, al, ll)),
                                Xb = new zn(He({}, cl, ll)),
                                Gb = {
                                    ws: Kb,
                                    xhr_streaming: Jb,
                                    xhr_polling: Xb,
                                };
                            const gr = Gb;
                            var Zb = new zn({
                                    file: "sockjs",
                                    urls: zb,
                                    handlesActivityChecks: !0,
                                    supportsPing: !1,
                                    isSupported: function () {
                                        return !0;
                                    },
                                    isInitialized: function () {
                                        return window.SockJS !== void 0;
                                    },
                                    getSocket: function (f, o) {
                                        return new window.SockJS(f, null, {
                                            js_path: P.getPath("sockjs", {
                                                useTLS: o.useTLS,
                                            }),
                                            ignore_null_origin:
                                                o.ignoreNullOrigin,
                                        });
                                    },
                                    beforeOpen: function (f, o) {
                                        f.send(JSON.stringify({ path: o }));
                                    },
                                }),
                                ul = {
                                    isSupported: function (f) {
                                        var o = me.isXDRSupported(f.useTLS);
                                        return o;
                                    },
                                },
                                Qb = new zn(He({}, al, ul)),
                                Yb = new zn(He({}, cl, ul));
                            ((gr.xdr_streaming = Qb),
                                (gr.xdr_polling = Yb),
                                (gr.sockjs = Zb));
                            const ey = gr;
                            class ty extends nn {
                                constructor() {
                                    super();
                                    var o = this;
                                    typeof window < "u" &&
                                        window.addEventListener !== void 0 &&
                                        (window.addEventListener(
                                            "online",
                                            function () {
                                                o.emit("online");
                                            },
                                            !1,
                                        ),
                                        window.addEventListener(
                                            "offline",
                                            function () {
                                                o.emit("offline");
                                            },
                                            !1,
                                        ));
                                }
                                isOnline() {
                                    return window.navigator.onLine === void 0
                                        ? !0
                                        : window.navigator.onLine;
                                }
                            }
                            var ny = new ty();
                            class sy {
                                constructor(o, l, p) {
                                    ((this.manager = o),
                                        (this.transport = l),
                                        (this.minPingDelay = p.minPingDelay),
                                        (this.maxPingDelay = p.maxPingDelay),
                                        (this.pingDelay = void 0));
                                }
                                createConnection(o, l, p, _) {
                                    _ = He({}, _, {
                                        activityTimeout: this.pingDelay,
                                    });
                                    var N = this.transport.createConnection(
                                            o,
                                            l,
                                            p,
                                            _,
                                        ),
                                        q = null,
                                        Y = function () {
                                            (N.unbind("open", Y),
                                                N.bind("closed", pe),
                                                (q = Fe.now()));
                                        },
                                        pe = (Te) => {
                                            if (
                                                (N.unbind("closed", pe),
                                                Te.code === 1002 ||
                                                    Te.code === 1003)
                                            )
                                                this.manager.reportDeath();
                                            else if (!Te.wasClean && q) {
                                                var Ae = Fe.now() - q;
                                                Ae < 2 * this.maxPingDelay &&
                                                    (this.manager.reportDeath(),
                                                    (this.pingDelay = Math.max(
                                                        Ae / 2,
                                                        this.minPingDelay,
                                                    )));
                                            }
                                        };
                                    return (N.bind("open", Y), N);
                                }
                                isSupported(o) {
                                    return (
                                        this.manager.isAlive() &&
                                        this.transport.isSupported(o)
                                    );
                                }
                            }
                            const fl = {
                                    decodeMessage: function (f) {
                                        try {
                                            var o = JSON.parse(f.data),
                                                l = o.data;
                                            if (typeof l == "string")
                                                try {
                                                    l = JSON.parse(o.data);
                                                } catch {}
                                            var p = {
                                                event: o.event,
                                                channel: o.channel,
                                                data: l,
                                            };
                                            return (
                                                o.user_id &&
                                                    (p.user_id = o.user_id),
                                                p
                                            );
                                        } catch (_) {
                                            throw {
                                                type: "MessageParseError",
                                                error: _,
                                                data: f.data,
                                            };
                                        }
                                    },
                                    encodeMessage: function (f) {
                                        return JSON.stringify(f);
                                    },
                                    processHandshake: function (f) {
                                        var o = fl.decodeMessage(f);
                                        if (
                                            o.event ===
                                            "pusher:connection_established"
                                        ) {
                                            if (!o.data.activity_timeout)
                                                throw "No activity timeout specified in handshake";
                                            return {
                                                action: "connected",
                                                id: o.data.socket_id,
                                                activityTimeout:
                                                    o.data.activity_timeout *
                                                    1e3,
                                            };
                                        } else {
                                            if (o.event === "pusher:error")
                                                return {
                                                    action: this.getCloseAction(
                                                        o.data,
                                                    ),
                                                    error: this.getCloseError(
                                                        o.data,
                                                    ),
                                                };
                                            throw "Invalid handshake";
                                        }
                                    },
                                    getCloseAction: function (f) {
                                        return f.code < 4e3
                                            ? f.code >= 1002 && f.code <= 1004
                                                ? "backoff"
                                                : null
                                            : f.code === 4e3
                                              ? "tls_only"
                                              : f.code < 4100
                                                ? "refused"
                                                : f.code < 4200
                                                  ? "backoff"
                                                  : f.code < 4300
                                                    ? "retry"
                                                    : "refused";
                                    },
                                    getCloseError: function (f) {
                                        return f.code !== 1e3 && f.code !== 1001
                                            ? {
                                                  type: "PusherError",
                                                  data: {
                                                      code: f.code,
                                                      message:
                                                          f.reason || f.message,
                                                  },
                                              }
                                            : null;
                                    },
                                },
                                wn = fl;
                            class ry extends nn {
                                constructor(o, l) {
                                    (super(),
                                        (this.id = o),
                                        (this.transport = l),
                                        (this.activityTimeout =
                                            l.activityTimeout),
                                        this.bindListeners());
                                }
                                handlesActivityChecks() {
                                    return this.transport.handlesActivityChecks();
                                }
                                send(o) {
                                    return this.transport.send(o);
                                }
                                send_event(o, l, p) {
                                    var _ = { event: o, data: l };
                                    return (
                                        p && (_.channel = p),
                                        de.debug("Event sent", _),
                                        this.send(wn.encodeMessage(_))
                                    );
                                }
                                ping() {
                                    this.transport.supportsPing()
                                        ? this.transport.ping()
                                        : this.send_event("pusher:ping", {});
                                }
                                close() {
                                    this.transport.close();
                                }
                                bindListeners() {
                                    var o = {
                                            message: (p) => {
                                                var _;
                                                try {
                                                    _ = wn.decodeMessage(p);
                                                } catch (N) {
                                                    this.emit("error", {
                                                        type: "MessageParseError",
                                                        error: N,
                                                        data: p.data,
                                                    });
                                                }
                                                if (_ !== void 0) {
                                                    switch (
                                                        (de.debug(
                                                            "Event recd",
                                                            _,
                                                        ),
                                                        _.event)
                                                    ) {
                                                        case "pusher:error":
                                                            this.emit("error", {
                                                                type: "PusherError",
                                                                data: _.data,
                                                            });
                                                            break;
                                                        case "pusher:ping":
                                                            this.emit("ping");
                                                            break;
                                                        case "pusher:pong":
                                                            this.emit("pong");
                                                            break;
                                                    }
                                                    this.emit("message", _);
                                                }
                                            },
                                            activity: () => {
                                                this.emit("activity");
                                            },
                                            error: (p) => {
                                                this.emit("error", p);
                                            },
                                            closed: (p) => {
                                                (l(),
                                                    p &&
                                                        p.code &&
                                                        this.handleCloseEvent(
                                                            p,
                                                        ),
                                                    (this.transport = null),
                                                    this.emit("closed"));
                                            },
                                        },
                                        l = () => {
                                            x(o, (p, _) => {
                                                this.transport.unbind(_, p);
                                            });
                                        };
                                    x(o, (p, _) => {
                                        this.transport.bind(_, p);
                                    });
                                }
                                handleCloseEvent(o) {
                                    var l = wn.getCloseAction(o),
                                        p = wn.getCloseError(o);
                                    (p && this.emit("error", p),
                                        l &&
                                            this.emit(l, {
                                                action: l,
                                                error: p,
                                            }));
                                }
                            }
                            class iy {
                                constructor(o, l) {
                                    ((this.transport = o),
                                        (this.callback = l),
                                        this.bindListeners());
                                }
                                close() {
                                    (this.unbindListeners(),
                                        this.transport.close());
                                }
                                bindListeners() {
                                    ((this.onMessage = (o) => {
                                        this.unbindListeners();
                                        var l;
                                        try {
                                            l = wn.processHandshake(o);
                                        } catch (p) {
                                            (this.finish("error", { error: p }),
                                                this.transport.close());
                                            return;
                                        }
                                        l.action === "connected"
                                            ? this.finish("connected", {
                                                  connection: new ry(
                                                      l.id,
                                                      this.transport,
                                                  ),
                                                  activityTimeout:
                                                      l.activityTimeout,
                                              })
                                            : (this.finish(l.action, {
                                                  error: l.error,
                                              }),
                                              this.transport.close());
                                    }),
                                        (this.onClosed = (o) => {
                                            this.unbindListeners();
                                            var l =
                                                    wn.getCloseAction(o) ||
                                                    "backoff",
                                                p = wn.getCloseError(o);
                                            this.finish(l, { error: p });
                                        }),
                                        this.transport.bind(
                                            "message",
                                            this.onMessage,
                                        ),
                                        this.transport.bind(
                                            "closed",
                                            this.onClosed,
                                        ));
                                }
                                unbindListeners() {
                                    (this.transport.unbind(
                                        "message",
                                        this.onMessage,
                                    ),
                                        this.transport.unbind(
                                            "closed",
                                            this.onClosed,
                                        ));
                                }
                                finish(o, l) {
                                    this.callback(
                                        He(
                                            {
                                                transport: this.transport,
                                                action: o,
                                            },
                                            l,
                                        ),
                                    );
                                }
                            }
                            class oy {
                                constructor(o, l) {
                                    ((this.timeline = o),
                                        (this.options = l || {}));
                                }
                                send(o, l) {
                                    this.timeline.isEmpty() ||
                                        this.timeline.send(
                                            me.TimelineTransport.getAgent(
                                                this,
                                                o,
                                            ),
                                            l,
                                        );
                                }
                            }
                            class Fi extends nn {
                                constructor(o, l) {
                                    (super(function (p, _) {
                                        de.debug(
                                            "No callbacks on " +
                                                o +
                                                " for " +
                                                p,
                                        );
                                    }),
                                        (this.name = o),
                                        (this.pusher = l),
                                        (this.subscribed = !1),
                                        (this.subscriptionPending = !1),
                                        (this.subscriptionCancelled = !1));
                                }
                                authorize(o, l) {
                                    return l(null, { auth: "" });
                                }
                                trigger(o, l) {
                                    if (o.indexOf("client-") !== 0)
                                        throw new b(
                                            "Event '" +
                                                o +
                                                "' does not start with 'client-'",
                                        );
                                    if (!this.subscribed) {
                                        var p = m.buildLogSuffix(
                                            "triggeringClientEvents",
                                        );
                                        de.warn(
                                            `Client event triggered before channel 'subscription_succeeded' event . ${p}`,
                                        );
                                    }
                                    return this.pusher.send_event(
                                        o,
                                        l,
                                        this.name,
                                    );
                                }
                                disconnect() {
                                    ((this.subscribed = !1),
                                        (this.subscriptionPending = !1));
                                }
                                handleEvent(o) {
                                    var l = o.event,
                                        p = o.data;
                                    if (
                                        l ===
                                        "pusher_internal:subscription_succeeded"
                                    )
                                        this.handleSubscriptionSucceededEvent(
                                            o,
                                        );
                                    else if (
                                        l ===
                                        "pusher_internal:subscription_count"
                                    )
                                        this.handleSubscriptionCountEvent(o);
                                    else if (
                                        l.indexOf("pusher_internal:") !== 0
                                    ) {
                                        var _ = {};
                                        this.emit(l, p, _);
                                    }
                                }
                                handleSubscriptionSucceededEvent(o) {
                                    ((this.subscriptionPending = !1),
                                        (this.subscribed = !0),
                                        this.subscriptionCancelled
                                            ? this.pusher.unsubscribe(this.name)
                                            : this.emit(
                                                  "pusher:subscription_succeeded",
                                                  o.data,
                                              ));
                                }
                                handleSubscriptionCountEvent(o) {
                                    (o.data.subscription_count &&
                                        (this.subscriptionCount =
                                            o.data.subscription_count),
                                        this.emit(
                                            "pusher:subscription_count",
                                            o.data,
                                        ));
                                }
                                subscribe() {
                                    this.subscribed ||
                                        ((this.subscriptionPending = !0),
                                        (this.subscriptionCancelled = !1),
                                        this.authorize(
                                            this.pusher.connection.socket_id,
                                            (o, l) => {
                                                o
                                                    ? ((this.subscriptionPending =
                                                          !1),
                                                      de.error(o.toString()),
                                                      this.emit(
                                                          "pusher:subscription_error",
                                                          Object.assign(
                                                              {},
                                                              {
                                                                  type: "AuthError",
                                                                  error: o.message,
                                                              },
                                                              o instanceof Q
                                                                  ? {
                                                                        status: o.status,
                                                                    }
                                                                  : {},
                                                          ),
                                                      ))
                                                    : this.pusher.send_event(
                                                          "pusher:subscribe",
                                                          {
                                                              auth: l.auth,
                                                              channel_data:
                                                                  l.channel_data,
                                                              channel:
                                                                  this.name,
                                                          },
                                                      );
                                            },
                                        ));
                                }
                                unsubscribe() {
                                    ((this.subscribed = !1),
                                        this.pusher.send_event(
                                            "pusher:unsubscribe",
                                            { channel: this.name },
                                        ));
                                }
                                cancelSubscription() {
                                    this.subscriptionCancelled = !0;
                                }
                                reinstateSubscription() {
                                    this.subscriptionCancelled = !1;
                                }
                            }
                            class Hi extends Fi {
                                authorize(o, l) {
                                    return this.pusher.config.channelAuthorizer(
                                        { channelName: this.name, socketId: o },
                                        l,
                                    );
                                }
                            }
                            class ay {
                                constructor() {
                                    this.reset();
                                }
                                get(o) {
                                    return Object.prototype.hasOwnProperty.call(
                                        this.members,
                                        o,
                                    )
                                        ? { id: o, info: this.members[o] }
                                        : null;
                                }
                                each(o) {
                                    x(this.members, (l, p) => {
                                        o(this.get(p));
                                    });
                                }
                                setMyID(o) {
                                    this.myID = o;
                                }
                                onSubscription(o) {
                                    ((this.members = o.presence.hash),
                                        (this.count = o.presence.count),
                                        (this.me = this.get(this.myID)));
                                }
                                addMember(o) {
                                    return (
                                        this.get(o.user_id) === null &&
                                            this.count++,
                                        (this.members[o.user_id] = o.user_info),
                                        this.get(o.user_id)
                                    );
                                }
                                removeMember(o) {
                                    var l = this.get(o.user_id);
                                    return (
                                        l &&
                                            (delete this.members[o.user_id],
                                            this.count--),
                                        l
                                    );
                                }
                                reset() {
                                    ((this.members = {}),
                                        (this.count = 0),
                                        (this.myID = null),
                                        (this.me = null));
                                }
                            }
                            var cy = function (f, o, l, p) {
                                function _(N) {
                                    return N instanceof l
                                        ? N
                                        : new l(function (q) {
                                              q(N);
                                          });
                                }
                                return new (l || (l = Promise))(function (
                                    N,
                                    q,
                                ) {
                                    function Y(Ae) {
                                        try {
                                            Te(p.next(Ae));
                                        } catch (Ve) {
                                            q(Ve);
                                        }
                                    }
                                    function pe(Ae) {
                                        try {
                                            Te(p.throw(Ae));
                                        } catch (Ve) {
                                            q(Ve);
                                        }
                                    }
                                    function Te(Ae) {
                                        Ae.done
                                            ? N(Ae.value)
                                            : _(Ae.value).then(Y, pe);
                                    }
                                    Te((p = p.apply(f, o || [])).next());
                                });
                            };
                            class ly extends Hi {
                                constructor(o, l) {
                                    (super(o, l), (this.members = new ay()));
                                }
                                authorize(o, l) {
                                    super.authorize(o, (p, _) =>
                                        cy(this, void 0, void 0, function* () {
                                            if (!p)
                                                if (
                                                    ((_ = _),
                                                    _.channel_data != null)
                                                ) {
                                                    var N = JSON.parse(
                                                        _.channel_data,
                                                    );
                                                    this.members.setMyID(
                                                        N.user_id,
                                                    );
                                                } else if (
                                                    (yield this.pusher.user
                                                        .signinDonePromise,
                                                    this.pusher.user
                                                        .user_data != null)
                                                )
                                                    this.members.setMyID(
                                                        this.pusher.user
                                                            .user_data.id,
                                                    );
                                                else {
                                                    let q = m.buildLogSuffix(
                                                        "authorizationEndpoint",
                                                    );
                                                    (de.error(
                                                        `Invalid auth response for channel '${this.name}', expected 'channel_data' field. ${q}, or the user should be signed in.`,
                                                    ),
                                                        l(
                                                            "Invalid auth response",
                                                        ));
                                                    return;
                                                }
                                            l(p, _);
                                        }),
                                    );
                                }
                                handleEvent(o) {
                                    var l = o.event;
                                    if (l.indexOf("pusher_internal:") === 0)
                                        this.handleInternalEvent(o);
                                    else {
                                        var p = o.data,
                                            _ = {};
                                        (o.user_id && (_.user_id = o.user_id),
                                            this.emit(l, p, _));
                                    }
                                }
                                handleInternalEvent(o) {
                                    var l = o.event,
                                        p = o.data;
                                    switch (l) {
                                        case "pusher_internal:subscription_succeeded":
                                            this.handleSubscriptionSucceededEvent(
                                                o,
                                            );
                                            break;
                                        case "pusher_internal:subscription_count":
                                            this.handleSubscriptionCountEvent(
                                                o,
                                            );
                                            break;
                                        case "pusher_internal:member_added":
                                            var _ = this.members.addMember(p);
                                            this.emit("pusher:member_added", _);
                                            break;
                                        case "pusher_internal:member_removed":
                                            var N =
                                                this.members.removeMember(p);
                                            N &&
                                                this.emit(
                                                    "pusher:member_removed",
                                                    N,
                                                );
                                            break;
                                    }
                                }
                                handleSubscriptionSucceededEvent(o) {
                                    ((this.subscriptionPending = !1),
                                        (this.subscribed = !0),
                                        this.subscriptionCancelled
                                            ? this.pusher.unsubscribe(this.name)
                                            : (this.members.onSubscription(
                                                  o.data,
                                              ),
                                              this.emit(
                                                  "pusher:subscription_succeeded",
                                                  this.members,
                                              )));
                                }
                                disconnect() {
                                    (this.members.reset(), super.disconnect());
                                }
                            }
                            var uy = u(978),
                                qi = u(594);
                            class fy extends Hi {
                                constructor(o, l, p) {
                                    (super(o, l),
                                        (this.key = null),
                                        (this.nacl = p));
                                }
                                authorize(o, l) {
                                    super.authorize(o, (p, _) => {
                                        if (p) {
                                            l(p, _);
                                            return;
                                        }
                                        let N = _.shared_secret;
                                        if (!N) {
                                            l(
                                                new Error(
                                                    `No shared_secret key in auth payload for encrypted channel: ${this.name}`,
                                                ),
                                                null,
                                            );
                                            return;
                                        }
                                        ((this.key = (0, qi.decode)(N)),
                                            delete _.shared_secret,
                                            l(null, _));
                                    });
                                }
                                trigger(o, l) {
                                    throw new ie(
                                        "Client events are not currently supported for encrypted channels",
                                    );
                                }
                                handleEvent(o) {
                                    var l = o.event,
                                        p = o.data;
                                    if (
                                        l.indexOf("pusher_internal:") === 0 ||
                                        l.indexOf("pusher:") === 0
                                    ) {
                                        super.handleEvent(o);
                                        return;
                                    }
                                    this.handleEncryptedEvent(l, p);
                                }
                                handleEncryptedEvent(o, l) {
                                    if (!this.key) {
                                        de.debug(
                                            "Received encrypted event before key has been retrieved from the authEndpoint",
                                        );
                                        return;
                                    }
                                    if (!l.ciphertext || !l.nonce) {
                                        de.error(
                                            "Unexpected format for encrypted event, expected object with `ciphertext` and `nonce` fields, got: " +
                                                l,
                                        );
                                        return;
                                    }
                                    let p = (0, qi.decode)(l.ciphertext);
                                    if (
                                        p.length <
                                        this.nacl.secretbox.overheadLength
                                    ) {
                                        de.error(
                                            `Expected encrypted event ciphertext length to be ${this.nacl.secretbox.overheadLength}, got: ${p.length}`,
                                        );
                                        return;
                                    }
                                    let _ = (0, qi.decode)(l.nonce);
                                    if (
                                        _.length <
                                        this.nacl.secretbox.nonceLength
                                    ) {
                                        de.error(
                                            `Expected encrypted event nonce length to be ${this.nacl.secretbox.nonceLength}, got: ${_.length}`,
                                        );
                                        return;
                                    }
                                    let N = this.nacl.secretbox.open(
                                        p,
                                        _,
                                        this.key,
                                    );
                                    if (N === null) {
                                        (de.debug(
                                            "Failed to decrypt an event, probably because it was encrypted with a different key. Fetching a new key from the authEndpoint...",
                                        ),
                                            this.authorize(
                                                this.pusher.connection
                                                    .socket_id,
                                                (q, Y) => {
                                                    if (q) {
                                                        de.error(
                                                            `Failed to make a request to the authEndpoint: ${Y}. Unable to fetch new key, so dropping encrypted event`,
                                                        );
                                                        return;
                                                    }
                                                    if (
                                                        ((N =
                                                            this.nacl.secretbox.open(
                                                                p,
                                                                _,
                                                                this.key,
                                                            )),
                                                        N === null)
                                                    ) {
                                                        de.error(
                                                            "Failed to decrypt event with new key. Dropping encrypted event",
                                                        );
                                                        return;
                                                    }
                                                    this.emit(
                                                        o,
                                                        this.getDataToEmit(N),
                                                    );
                                                },
                                            ));
                                        return;
                                    }
                                    this.emit(o, this.getDataToEmit(N));
                                }
                                getDataToEmit(o) {
                                    let l = (0, uy.D4)(o);
                                    try {
                                        return JSON.parse(l);
                                    } catch {
                                        return l;
                                    }
                                }
                            }
                            class dy extends nn {
                                constructor(o, l) {
                                    (super(),
                                        (this.state = "initialized"),
                                        (this.connection = null),
                                        (this.key = o),
                                        (this.options = l),
                                        (this.timeline = this.options.timeline),
                                        (this.usingTLS = this.options.useTLS),
                                        (this.errorCallbacks =
                                            this.buildErrorCallbacks()),
                                        (this.connectionCallbacks =
                                            this.buildConnectionCallbacks(
                                                this.errorCallbacks,
                                            )),
                                        (this.handshakeCallbacks =
                                            this.buildHandshakeCallbacks(
                                                this.errorCallbacks,
                                            )));
                                    var p = me.getNetwork();
                                    (p.bind("online", () => {
                                        (this.timeline.info({
                                            netinfo: "online",
                                        }),
                                            (this.state === "connecting" ||
                                                this.state === "unavailable") &&
                                                this.retryIn(0));
                                    }),
                                        p.bind("offline", () => {
                                            (this.timeline.info({
                                                netinfo: "offline",
                                            }),
                                                this.connection &&
                                                    this.sendActivityCheck());
                                        }),
                                        this.updateStrategy());
                                }
                                switchCluster(o) {
                                    ((this.key = o),
                                        this.updateStrategy(),
                                        this.retryIn(0));
                                }
                                connect() {
                                    if (!(this.connection || this.runner)) {
                                        if (!this.strategy.isSupported()) {
                                            this.updateState("failed");
                                            return;
                                        }
                                        (this.updateState("connecting"),
                                            this.startConnecting(),
                                            this.setUnavailableTimer());
                                    }
                                }
                                send(o) {
                                    return this.connection
                                        ? this.connection.send(o)
                                        : !1;
                                }
                                send_event(o, l, p) {
                                    return this.connection
                                        ? this.connection.send_event(o, l, p)
                                        : !1;
                                }
                                disconnect() {
                                    (this.disconnectInternally(),
                                        this.updateState("disconnected"));
                                }
                                isUsingTLS() {
                                    return this.usingTLS;
                                }
                                startConnecting() {
                                    var o = (l, p) => {
                                        l
                                            ? (this.runner =
                                                  this.strategy.connect(0, o))
                                            : p.action === "error"
                                              ? (this.emit("error", {
                                                    type: "HandshakeError",
                                                    error: p.error,
                                                }),
                                                this.timeline.error({
                                                    handshakeError: p.error,
                                                }))
                                              : (this.abortConnecting(),
                                                this.handshakeCallbacks[
                                                    p.action
                                                ](p));
                                    };
                                    this.runner = this.strategy.connect(0, o);
                                }
                                abortConnecting() {
                                    this.runner &&
                                        (this.runner.abort(),
                                        (this.runner = null));
                                }
                                disconnectInternally() {
                                    if (
                                        (this.abortConnecting(),
                                        this.clearRetryTimer(),
                                        this.clearUnavailableTimer(),
                                        this.connection)
                                    ) {
                                        var o = this.abandonConnection();
                                        o.close();
                                    }
                                }
                                updateStrategy() {
                                    this.strategy = this.options.getStrategy({
                                        key: this.key,
                                        timeline: this.timeline,
                                        useTLS: this.usingTLS,
                                    });
                                }
                                retryIn(o) {
                                    (this.timeline.info({
                                        action: "retry",
                                        delay: o,
                                    }),
                                        o > 0 &&
                                            this.emit(
                                                "connecting_in",
                                                Math.round(o / 1e3),
                                            ),
                                        (this.retryTimer = new le(
                                            o || 0,
                                            () => {
                                                (this.disconnectInternally(),
                                                    this.connect());
                                            },
                                        )));
                                }
                                clearRetryTimer() {
                                    this.retryTimer &&
                                        (this.retryTimer.ensureAborted(),
                                        (this.retryTimer = null));
                                }
                                setUnavailableTimer() {
                                    this.unavailableTimer = new le(
                                        this.options.unavailableTimeout,
                                        () => {
                                            this.updateState("unavailable");
                                        },
                                    );
                                }
                                clearUnavailableTimer() {
                                    this.unavailableTimer &&
                                        this.unavailableTimer.ensureAborted();
                                }
                                sendActivityCheck() {
                                    (this.stopActivityCheck(),
                                        this.connection.ping(),
                                        (this.activityTimer = new le(
                                            this.options.pongTimeout,
                                            () => {
                                                (this.timeline.error({
                                                    pong_timed_out:
                                                        this.options
                                                            .pongTimeout,
                                                }),
                                                    this.retryIn(0));
                                            },
                                        )));
                                }
                                resetActivityCheck() {
                                    (this.stopActivityCheck(),
                                        this.connection &&
                                            !this.connection.handlesActivityChecks() &&
                                            (this.activityTimer = new le(
                                                this.activityTimeout,
                                                () => {
                                                    this.sendActivityCheck();
                                                },
                                            )));
                                }
                                stopActivityCheck() {
                                    this.activityTimer &&
                                        this.activityTimer.ensureAborted();
                                }
                                buildConnectionCallbacks(o) {
                                    return He({}, o, {
                                        message: (l) => {
                                            (this.resetActivityCheck(),
                                                this.emit("message", l));
                                        },
                                        ping: () => {
                                            this.send_event("pusher:pong", {});
                                        },
                                        activity: () => {
                                            this.resetActivityCheck();
                                        },
                                        error: (l) => {
                                            this.emit("error", l);
                                        },
                                        closed: () => {
                                            (this.abandonConnection(),
                                                this.shouldRetry() &&
                                                    this.retryIn(1e3));
                                        },
                                    });
                                }
                                buildHandshakeCallbacks(o) {
                                    return He({}, o, {
                                        connected: (l) => {
                                            ((this.activityTimeout = Math.min(
                                                this.options.activityTimeout,
                                                l.activityTimeout,
                                                l.connection.activityTimeout ||
                                                    1 / 0,
                                            )),
                                                this.clearUnavailableTimer(),
                                                this.setConnection(
                                                    l.connection,
                                                ),
                                                (this.socket_id =
                                                    this.connection.id),
                                                this.updateState("connected", {
                                                    socket_id: this.socket_id,
                                                }));
                                        },
                                    });
                                }
                                buildErrorCallbacks() {
                                    let o = (l) => (p) => {
                                        (p.error &&
                                            this.emit("error", {
                                                type: "WebSocketError",
                                                error: p.error,
                                            }),
                                            l(p));
                                    };
                                    return {
                                        tls_only: o(() => {
                                            ((this.usingTLS = !0),
                                                this.updateStrategy(),
                                                this.retryIn(0));
                                        }),
                                        refused: o(() => {
                                            this.disconnect();
                                        }),
                                        backoff: o(() => {
                                            this.retryIn(1e3);
                                        }),
                                        retry: o(() => {
                                            this.retryIn(0);
                                        }),
                                    };
                                }
                                setConnection(o) {
                                    this.connection = o;
                                    for (var l in this.connectionCallbacks)
                                        this.connection.bind(
                                            l,
                                            this.connectionCallbacks[l],
                                        );
                                    this.resetActivityCheck();
                                }
                                abandonConnection() {
                                    if (this.connection) {
                                        this.stopActivityCheck();
                                        for (var o in this.connectionCallbacks)
                                            this.connection.unbind(
                                                o,
                                                this.connectionCallbacks[o],
                                            );
                                        var l = this.connection;
                                        return ((this.connection = null), l);
                                    }
                                }
                                updateState(o, l) {
                                    var p = this.state;
                                    if (((this.state = o), p !== o)) {
                                        var _ = o;
                                        (_ === "connected" &&
                                            (_ +=
                                                " with new socket ID " +
                                                l.socket_id),
                                            de.debug(
                                                "State changed",
                                                p + " -> " + _,
                                            ),
                                            this.timeline.info({
                                                state: o,
                                                params: l,
                                            }),
                                            this.emit("state_change", {
                                                previous: p,
                                                current: o,
                                            }),
                                            this.emit(o, l));
                                    }
                                }
                                shouldRetry() {
                                    return (
                                        this.state === "connecting" ||
                                        this.state === "connected"
                                    );
                                }
                            }
                            class hy {
                                constructor() {
                                    this.channels = {};
                                }
                                add(o, l) {
                                    return (
                                        this.channels[o] ||
                                            (this.channels[o] = py(o, l)),
                                        this.channels[o]
                                    );
                                }
                                all() {
                                    return j(this.channels);
                                }
                                find(o) {
                                    return this.channels[o];
                                }
                                remove(o) {
                                    var l = this.channels[o];
                                    return (delete this.channels[o], l);
                                }
                                disconnect() {
                                    x(this.channels, function (o) {
                                        o.disconnect();
                                    });
                                }
                            }
                            function py(f, o) {
                                if (f.indexOf("private-encrypted-") === 0) {
                                    if (o.config.nacl)
                                        return sn.createEncryptedChannel(
                                            f,
                                            o,
                                            o.config.nacl,
                                        );
                                    let l =
                                            "Tried to subscribe to a private-encrypted- channel but no nacl implementation available",
                                        p = m.buildLogSuffix(
                                            "encryptedChannelSupport",
                                        );
                                    throw new ie(`${l}. ${p}`);
                                } else {
                                    if (f.indexOf("private-") === 0)
                                        return sn.createPrivateChannel(f, o);
                                    if (f.indexOf("presence-") === 0)
                                        return sn.createPresenceChannel(f, o);
                                    if (f.indexOf("#") === 0)
                                        throw new L(
                                            'Cannot create a channel with name "' +
                                                f +
                                                '".',
                                        );
                                    return sn.createChannel(f, o);
                                }
                            }
                            var vy = {
                                createChannels() {
                                    return new hy();
                                },
                                createConnectionManager(f, o) {
                                    return new dy(f, o);
                                },
                                createChannel(f, o) {
                                    return new Fi(f, o);
                                },
                                createPrivateChannel(f, o) {
                                    return new Hi(f, o);
                                },
                                createPresenceChannel(f, o) {
                                    return new ly(f, o);
                                },
                                createEncryptedChannel(f, o, l) {
                                    return new fy(f, o, l);
                                },
                                createTimelineSender(f, o) {
                                    return new oy(f, o);
                                },
                                createHandshake(f, o) {
                                    return new iy(f, o);
                                },
                                createAssistantToTheTransportManager(f, o, l) {
                                    return new sy(f, o, l);
                                },
                            };
                            const sn = vy;
                            class dl {
                                constructor(o) {
                                    ((this.options = o || {}),
                                        (this.livesLeft =
                                            this.options.lives || 1 / 0));
                                }
                                getAssistant(o) {
                                    return sn.createAssistantToTheTransportManager(
                                        this,
                                        o,
                                        {
                                            minPingDelay:
                                                this.options.minPingDelay,
                                            maxPingDelay:
                                                this.options.maxPingDelay,
                                        },
                                    );
                                }
                                isAlive() {
                                    return this.livesLeft > 0;
                                }
                                reportDeath() {
                                    this.livesLeft -= 1;
                                }
                            }
                            class xn {
                                constructor(o, l) {
                                    ((this.strategies = o),
                                        (this.loop = !!l.loop),
                                        (this.failFast = !!l.failFast),
                                        (this.timeout = l.timeout),
                                        (this.timeoutLimit = l.timeoutLimit));
                                }
                                isSupported() {
                                    return te(
                                        this.strategies,
                                        Fe.method("isSupported"),
                                    );
                                }
                                connect(o, l) {
                                    var p = this.strategies,
                                        _ = 0,
                                        N = this.timeout,
                                        q = null,
                                        Y = (pe, Te) => {
                                            Te
                                                ? l(null, Te)
                                                : ((_ = _ + 1),
                                                  this.loop &&
                                                      (_ = _ % p.length),
                                                  _ < p.length
                                                      ? (N &&
                                                            ((N = N * 2),
                                                            this.timeoutLimit &&
                                                                (N = Math.min(
                                                                    N,
                                                                    this
                                                                        .timeoutLimit,
                                                                ))),
                                                        (q = this.tryStrategy(
                                                            p[_],
                                                            o,
                                                            {
                                                                timeout: N,
                                                                failFast:
                                                                    this
                                                                        .failFast,
                                                            },
                                                            Y,
                                                        )))
                                                      : l(!0));
                                        };
                                    return (
                                        (q = this.tryStrategy(
                                            p[_],
                                            o,
                                            {
                                                timeout: N,
                                                failFast: this.failFast,
                                            },
                                            Y,
                                        )),
                                        {
                                            abort: function () {
                                                q.abort();
                                            },
                                            forceMinPriority: function (pe) {
                                                ((o = pe),
                                                    q &&
                                                        q.forceMinPriority(pe));
                                            },
                                        }
                                    );
                                }
                                tryStrategy(o, l, p, _) {
                                    var N = null,
                                        q = null;
                                    return (
                                        p.timeout > 0 &&
                                            (N = new le(p.timeout, function () {
                                                (q.abort(), _(!0));
                                            })),
                                        (q = o.connect(l, function (Y, pe) {
                                            (Y &&
                                                N &&
                                                N.isRunning() &&
                                                !p.failFast) ||
                                                (N && N.ensureAborted(),
                                                _(Y, pe));
                                        })),
                                        {
                                            abort: function () {
                                                (N && N.ensureAborted(),
                                                    q.abort());
                                            },
                                            forceMinPriority: function (Y) {
                                                q.forceMinPriority(Y);
                                            },
                                        }
                                    );
                                }
                            }
                            class zi {
                                constructor(o) {
                                    this.strategies = o;
                                }
                                isSupported() {
                                    return te(
                                        this.strategies,
                                        Fe.method("isSupported"),
                                    );
                                }
                                connect(o, l) {
                                    return my(
                                        this.strategies,
                                        o,
                                        function (p, _) {
                                            return function (N, q) {
                                                if (((_[p].error = N), N)) {
                                                    gy(_) && l(!0);
                                                    return;
                                                }
                                                (R(_, function (Y) {
                                                    Y.forceMinPriority(
                                                        q.transport.priority,
                                                    );
                                                }),
                                                    l(null, q));
                                            };
                                        },
                                    );
                                }
                            }
                            function my(f, o, l) {
                                var p = D(f, function (_, N, q, Y) {
                                    return _.connect(o, l(N, Y));
                                });
                                return {
                                    abort: function () {
                                        R(p, by);
                                    },
                                    forceMinPriority: function (_) {
                                        R(p, function (N) {
                                            N.forceMinPriority(_);
                                        });
                                    },
                                };
                            }
                            function gy(f) {
                                return W(f, function (o) {
                                    return !!o.error;
                                });
                            }
                            function by(f) {
                                !f.error &&
                                    !f.aborted &&
                                    (f.abort(), (f.aborted = !0));
                            }
                            class yy {
                                constructor(o, l, p) {
                                    ((this.strategy = o),
                                        (this.transports = l),
                                        (this.ttl = p.ttl || 18e5),
                                        (this.usingTLS = p.useTLS),
                                        (this.timeline = p.timeline));
                                }
                                isSupported() {
                                    return this.strategy.isSupported();
                                }
                                connect(o, l) {
                                    var p = this.usingTLS,
                                        _ = _y(p),
                                        N =
                                            _ && _.cacheSkipCount
                                                ? _.cacheSkipCount
                                                : 0,
                                        q = [this.strategy];
                                    if (
                                        _ &&
                                        _.timestamp + this.ttl >= Fe.now()
                                    ) {
                                        var Y = this.transports[_.transport];
                                        Y &&
                                            (["ws", "wss"].includes(
                                                _.transport,
                                            ) || N > 3
                                                ? (this.timeline.info({
                                                      cached: !0,
                                                      transport: _.transport,
                                                      latency: _.latency,
                                                  }),
                                                  q.push(
                                                      new xn([Y], {
                                                          timeout:
                                                              _.latency * 2 +
                                                              1e3,
                                                          failFast: !0,
                                                      }),
                                                  ))
                                                : N++);
                                    }
                                    var pe = Fe.now(),
                                        Te = q
                                            .pop()
                                            .connect(o, function Ae(Ve, wr) {
                                                Ve
                                                    ? (hl(p),
                                                      q.length > 0
                                                          ? ((pe = Fe.now()),
                                                            (Te = q
                                                                .pop()
                                                                .connect(
                                                                    o,
                                                                    Ae,
                                                                )))
                                                          : l(Ve))
                                                    : (wy(
                                                          p,
                                                          wr.transport.name,
                                                          Fe.now() - pe,
                                                          N,
                                                      ),
                                                      l(null, wr));
                                            });
                                    return {
                                        abort: function () {
                                            Te.abort();
                                        },
                                        forceMinPriority: function (Ae) {
                                            ((o = Ae),
                                                Te && Te.forceMinPriority(Ae));
                                        },
                                    };
                                }
                            }
                            function Vi(f) {
                                return (
                                    "pusherTransport" + (f ? "TLS" : "NonTLS")
                                );
                            }
                            function _y(f) {
                                var o = me.getLocalStorage();
                                if (o)
                                    try {
                                        var l = o[Vi(f)];
                                        if (l) return JSON.parse(l);
                                    } catch {
                                        hl(f);
                                    }
                                return null;
                            }
                            function wy(f, o, l, p) {
                                var _ = me.getLocalStorage();
                                if (_)
                                    try {
                                        _[Vi(f)] = Ce({
                                            timestamp: Fe.now(),
                                            transport: o,
                                            latency: l,
                                            cacheSkipCount: p,
                                        });
                                    } catch {}
                            }
                            function hl(f) {
                                var o = me.getLocalStorage();
                                if (o)
                                    try {
                                        delete o[Vi(f)];
                                    } catch {}
                            }
                            class br {
                                constructor(o, { delay: l }) {
                                    ((this.strategy = o),
                                        (this.options = { delay: l }));
                                }
                                isSupported() {
                                    return this.strategy.isSupported();
                                }
                                connect(o, l) {
                                    var p = this.strategy,
                                        _,
                                        N = new le(
                                            this.options.delay,
                                            function () {
                                                _ = p.connect(o, l);
                                            },
                                        );
                                    return {
                                        abort: function () {
                                            (N.ensureAborted(), _ && _.abort());
                                        },
                                        forceMinPriority: function (q) {
                                            ((o = q),
                                                _ && _.forceMinPriority(q));
                                        },
                                    };
                                }
                            }
                            class _s {
                                constructor(o, l, p) {
                                    ((this.test = o),
                                        (this.trueBranch = l),
                                        (this.falseBranch = p));
                                }
                                isSupported() {
                                    var o = this.test()
                                        ? this.trueBranch
                                        : this.falseBranch;
                                    return o.isSupported();
                                }
                                connect(o, l) {
                                    var p = this.test()
                                        ? this.trueBranch
                                        : this.falseBranch;
                                    return p.connect(o, l);
                                }
                            }
                            class xy {
                                constructor(o) {
                                    this.strategy = o;
                                }
                                isSupported() {
                                    return this.strategy.isSupported();
                                }
                                connect(o, l) {
                                    var p = this.strategy.connect(
                                        o,
                                        function (_, N) {
                                            (N && p.abort(), l(_, N));
                                        },
                                    );
                                    return p;
                                }
                            }
                            function ws(f) {
                                return function () {
                                    return f.isSupported();
                                };
                            }
                            var ky = function (f, o, l) {
                                var p = {};
                                function _(Tl, __, w_, x_, k_) {
                                    var El = l(f, Tl, __, w_, x_, k_);
                                    return ((p[Tl] = El), El);
                                }
                                var N = Object.assign({}, o, {
                                        hostNonTLS: f.wsHost + ":" + f.wsPort,
                                        hostTLS: f.wsHost + ":" + f.wssPort,
                                        httpPath: f.wsPath,
                                    }),
                                    q = Object.assign({}, N, { useTLS: !0 }),
                                    Y = Object.assign({}, o, {
                                        hostNonTLS:
                                            f.httpHost + ":" + f.httpPort,
                                        hostTLS: f.httpHost + ":" + f.httpsPort,
                                        httpPath: f.httpPath,
                                    }),
                                    pe = {
                                        loop: !0,
                                        timeout: 15e3,
                                        timeoutLimit: 6e4,
                                    },
                                    Te = new dl({
                                        minPingDelay: 1e4,
                                        maxPingDelay: f.activityTimeout,
                                    }),
                                    Ae = new dl({
                                        lives: 2,
                                        minPingDelay: 1e4,
                                        maxPingDelay: f.activityTimeout,
                                    }),
                                    Ve = _("ws", "ws", 3, N, Te),
                                    wr = _("wss", "ws", 3, q, Te),
                                    v_ = _("sockjs", "sockjs", 1, Y),
                                    _l = _(
                                        "xhr_streaming",
                                        "xhr_streaming",
                                        1,
                                        Y,
                                        Ae,
                                    ),
                                    m_ = _(
                                        "xdr_streaming",
                                        "xdr_streaming",
                                        1,
                                        Y,
                                        Ae,
                                    ),
                                    wl = _("xhr_polling", "xhr_polling", 1, Y),
                                    g_ = _("xdr_polling", "xdr_polling", 1, Y),
                                    xl = new xn([Ve], pe),
                                    b_ = new xn([wr], pe),
                                    y_ = new xn([v_], pe),
                                    kl = new xn([new _s(ws(_l), _l, m_)], pe),
                                    Sl = new xn([new _s(ws(wl), wl, g_)], pe),
                                    Cl = new xn(
                                        [
                                            new _s(
                                                ws(kl),
                                                new zi([
                                                    kl,
                                                    new br(Sl, { delay: 4e3 }),
                                                ]),
                                                Sl,
                                            ),
                                        ],
                                        pe,
                                    ),
                                    Ji = new _s(ws(Cl), Cl, y_),
                                    Xi;
                                return (
                                    o.useTLS
                                        ? (Xi = new zi([
                                              xl,
                                              new br(Ji, { delay: 2e3 }),
                                          ]))
                                        : (Xi = new zi([
                                              xl,
                                              new br(b_, { delay: 2e3 }),
                                              new br(Ji, { delay: 5e3 }),
                                          ])),
                                    new yy(new xy(new _s(ws(Ve), Xi, Ji)), p, {
                                        ttl: 18e5,
                                        timeline: o.timeline,
                                        useTLS: o.useTLS,
                                    })
                                );
                            };
                            const Sy = ky;
                            function Cy() {
                                var f = this;
                                (f.timeline.info(
                                    f.buildTimelineMessage({
                                        transport:
                                            f.name +
                                            (f.options.useTLS ? "s" : ""),
                                    }),
                                ),
                                    f.hooks.isInitialized()
                                        ? f.changeState("initialized")
                                        : f.hooks.file
                                          ? (f.changeState("initializing"),
                                            P.load(
                                                f.hooks.file,
                                                { useTLS: f.options.useTLS },
                                                function (o, l) {
                                                    f.hooks.isInitialized()
                                                        ? (f.changeState(
                                                              "initialized",
                                                          ),
                                                          l(!0))
                                                        : (o && f.onError(o),
                                                          f.onClose(),
                                                          l(!1));
                                                },
                                            ))
                                          : f.onClose());
                            }
                            var Ty = {
                                getRequest: function (f) {
                                    var o = new window.XDomainRequest();
                                    return (
                                        (o.ontimeout = function () {
                                            (f.emit("error", new B()),
                                                f.close());
                                        }),
                                        (o.onerror = function (l) {
                                            (f.emit("error", l), f.close());
                                        }),
                                        (o.onprogress = function () {
                                            o.responseText &&
                                                o.responseText.length > 0 &&
                                                f.onChunk(200, o.responseText);
                                        }),
                                        (o.onload = function () {
                                            (o.responseText &&
                                                o.responseText.length > 0 &&
                                                f.onChunk(200, o.responseText),
                                                f.emit("finished", 200),
                                                f.close());
                                        }),
                                        o
                                    );
                                },
                                abortRequest: function (f) {
                                    ((f.ontimeout =
                                        f.onerror =
                                        f.onprogress =
                                        f.onload =
                                            null),
                                        f.abort());
                                },
                            };
                            const Ey = Ty,
                                Py = 256 * 1024;
                            class Oy extends nn {
                                constructor(o, l, p) {
                                    (super(),
                                        (this.hooks = o),
                                        (this.method = l),
                                        (this.url = p));
                                }
                                start(o) {
                                    ((this.position = 0),
                                        (this.xhr =
                                            this.hooks.getRequest(this)),
                                        (this.unloader = () => {
                                            this.close();
                                        }),
                                        me.addUnloadListener(this.unloader),
                                        this.xhr.open(
                                            this.method,
                                            this.url,
                                            !0,
                                        ),
                                        this.xhr.setRequestHeader &&
                                            this.xhr.setRequestHeader(
                                                "Content-Type",
                                                "application/json",
                                            ),
                                        this.xhr.send(o));
                                }
                                close() {
                                    (this.unloader &&
                                        (me.removeUnloadListener(this.unloader),
                                        (this.unloader = null)),
                                        this.xhr &&
                                            (this.hooks.abortRequest(this.xhr),
                                            (this.xhr = null)));
                                }
                                onChunk(o, l) {
                                    for (;;) {
                                        var p = this.advanceBuffer(l);
                                        if (p)
                                            this.emit("chunk", {
                                                status: o,
                                                data: p,
                                            });
                                        else break;
                                    }
                                    this.isBufferTooLong(l) &&
                                        this.emit("buffer_too_long");
                                }
                                advanceBuffer(o) {
                                    var l = o.slice(this.position),
                                        p = l.indexOf(`
`);
                                    return p !== -1
                                        ? ((this.position += p + 1),
                                          l.slice(0, p))
                                        : null;
                                }
                                isBufferTooLong(o) {
                                    return (
                                        this.position === o.length &&
                                        o.length > Py
                                    );
                                }
                            }
                            var Wi;
                            (function (f) {
                                ((f[(f.CONNECTING = 0)] = "CONNECTING"),
                                    (f[(f.OPEN = 1)] = "OPEN"),
                                    (f[(f.CLOSED = 3)] = "CLOSED"));
                            })(Wi || (Wi = {}));
                            const kn = Wi;
                            var Ry = 1;
                            class Ay {
                                constructor(o, l) {
                                    ((this.hooks = o),
                                        (this.session = vl(1e3) + "/" + Ny(8)),
                                        (this.location = $y(l)),
                                        (this.readyState = kn.CONNECTING),
                                        this.openStream());
                                }
                                send(o) {
                                    return this.sendRaw(JSON.stringify([o]));
                                }
                                ping() {
                                    this.hooks.sendHeartbeat(this);
                                }
                                close(o, l) {
                                    this.onClose(o, l, !0);
                                }
                                sendRaw(o) {
                                    if (this.readyState === kn.OPEN)
                                        try {
                                            return (
                                                me
                                                    .createSocketRequest(
                                                        "POST",
                                                        pl(
                                                            Ly(
                                                                this.location,
                                                                this.session,
                                                            ),
                                                        ),
                                                    )
                                                    .start(o),
                                                !0
                                            );
                                        } catch {
                                            return !1;
                                        }
                                    else return !1;
                                }
                                reconnect() {
                                    (this.closeStream(), this.openStream());
                                }
                                onClose(o, l, p) {
                                    (this.closeStream(),
                                        (this.readyState = kn.CLOSED),
                                        this.onclose &&
                                            this.onclose({
                                                code: o,
                                                reason: l,
                                                wasClean: p,
                                            }));
                                }
                                onChunk(o) {
                                    if (o.status === 200) {
                                        this.readyState === kn.OPEN &&
                                            this.onActivity();
                                        var l,
                                            p = o.data.slice(0, 1);
                                        switch (p) {
                                            case "o":
                                                ((l = JSON.parse(
                                                    o.data.slice(1) || "{}",
                                                )),
                                                    this.onOpen(l));
                                                break;
                                            case "a":
                                                l = JSON.parse(
                                                    o.data.slice(1) || "[]",
                                                );
                                                for (
                                                    var _ = 0;
                                                    _ < l.length;
                                                    _++
                                                )
                                                    this.onEvent(l[_]);
                                                break;
                                            case "m":
                                                ((l = JSON.parse(
                                                    o.data.slice(1) || "null",
                                                )),
                                                    this.onEvent(l));
                                                break;
                                            case "h":
                                                this.hooks.onHeartbeat(this);
                                                break;
                                            case "c":
                                                ((l = JSON.parse(
                                                    o.data.slice(1) || "[]",
                                                )),
                                                    this.onClose(
                                                        l[0],
                                                        l[1],
                                                        !0,
                                                    ));
                                                break;
                                        }
                                    }
                                }
                                onOpen(o) {
                                    this.readyState === kn.CONNECTING
                                        ? (o &&
                                              o.hostname &&
                                              (this.location.base = My(
                                                  this.location.base,
                                                  o.hostname,
                                              )),
                                          (this.readyState = kn.OPEN),
                                          this.onopen && this.onopen())
                                        : this.onClose(
                                              1006,
                                              "Server lost session",
                                              !0,
                                          );
                                }
                                onEvent(o) {
                                    this.readyState === kn.OPEN &&
                                        this.onmessage &&
                                        this.onmessage({ data: o });
                                }
                                onActivity() {
                                    this.onactivity && this.onactivity();
                                }
                                onError(o) {
                                    this.onerror && this.onerror(o);
                                }
                                openStream() {
                                    ((this.stream = me.createSocketRequest(
                                        "POST",
                                        pl(
                                            this.hooks.getReceiveURL(
                                                this.location,
                                                this.session,
                                            ),
                                        ),
                                    )),
                                        this.stream.bind("chunk", (o) => {
                                            this.onChunk(o);
                                        }),
                                        this.stream.bind("finished", (o) => {
                                            this.hooks.onFinished(this, o);
                                        }),
                                        this.stream.bind(
                                            "buffer_too_long",
                                            () => {
                                                this.reconnect();
                                            },
                                        ));
                                    try {
                                        this.stream.start();
                                    } catch (o) {
                                        Fe.defer(() => {
                                            (this.onError(o),
                                                this.onClose(
                                                    1006,
                                                    "Could not start streaming",
                                                    !1,
                                                ));
                                        });
                                    }
                                }
                                closeStream() {
                                    this.stream &&
                                        (this.stream.unbind_all(),
                                        this.stream.close(),
                                        (this.stream = null));
                                }
                            }
                            function $y(f) {
                                var o = /([^\?]*)\/*(\??.*)/.exec(f);
                                return { base: o[1], queryString: o[2] };
                            }
                            function Ly(f, o) {
                                return f.base + "/" + o + "/xhr_send";
                            }
                            function pl(f) {
                                var o = f.indexOf("?") === -1 ? "?" : "&";
                                return (
                                    f + o + "t=" + +new Date() + "&n=" + Ry++
                                );
                            }
                            function My(f, o) {
                                var l =
                                    /(https?:\/\/)([^\/:]+)((\/|:)?.*)/.exec(f);
                                return l[1] + o + l[3];
                            }
                            function vl(f) {
                                return me.randomInt(f);
                            }
                            function Ny(f) {
                                for (var o = [], l = 0; l < f; l++)
                                    o.push(vl(32).toString(32));
                                return o.join("");
                            }
                            const Dy = Ay;
                            var jy = {
                                getReceiveURL: function (f, o) {
                                    return (
                                        f.base +
                                        "/" +
                                        o +
                                        "/xhr_streaming" +
                                        f.queryString
                                    );
                                },
                                onHeartbeat: function (f) {
                                    f.sendRaw("[]");
                                },
                                sendHeartbeat: function (f) {
                                    f.sendRaw("[]");
                                },
                                onFinished: function (f, o) {
                                    f.onClose(
                                        1006,
                                        "Connection interrupted (" + o + ")",
                                        !1,
                                    );
                                },
                            };
                            const Iy = jy;
                            var Uy = {
                                getReceiveURL: function (f, o) {
                                    return (
                                        f.base +
                                        "/" +
                                        o +
                                        "/xhr" +
                                        f.queryString
                                    );
                                },
                                onHeartbeat: function () {},
                                sendHeartbeat: function (f) {
                                    f.sendRaw("[]");
                                },
                                onFinished: function (f, o) {
                                    o === 200
                                        ? f.reconnect()
                                        : f.onClose(
                                              1006,
                                              "Connection interrupted (" +
                                                  o +
                                                  ")",
                                              !1,
                                          );
                                },
                            };
                            const By = Uy;
                            var Fy = {
                                getRequest: function (f) {
                                    var o = me.getXHRAPI(),
                                        l = new o();
                                    return (
                                        (l.onreadystatechange = l.onprogress =
                                            function () {
                                                switch (l.readyState) {
                                                    case 3:
                                                        l.responseText &&
                                                            l.responseText
                                                                .length > 0 &&
                                                            f.onChunk(
                                                                l.status,
                                                                l.responseText,
                                                            );
                                                        break;
                                                    case 4:
                                                        (l.responseText &&
                                                            l.responseText
                                                                .length > 0 &&
                                                            f.onChunk(
                                                                l.status,
                                                                l.responseText,
                                                            ),
                                                            f.emit(
                                                                "finished",
                                                                l.status,
                                                            ),
                                                            f.close());
                                                        break;
                                                }
                                            }),
                                        l
                                    );
                                },
                                abortRequest: function (f) {
                                    ((f.onreadystatechange = null), f.abort());
                                },
                            };
                            const Hy = Fy;
                            var qy = {
                                createStreamingSocket(f) {
                                    return this.createSocket(Iy, f);
                                },
                                createPollingSocket(f) {
                                    return this.createSocket(By, f);
                                },
                                createSocket(f, o) {
                                    return new Dy(f, o);
                                },
                                createXHR(f, o) {
                                    return this.createRequest(Hy, f, o);
                                },
                                createRequest(f, o, l) {
                                    return new Oy(f, o, l);
                                },
                            };
                            const ml = qy;
                            ml.createXDR = function (f, o) {
                                return this.createRequest(Ey, f, o);
                            };
                            var zy = {
                                nextAuthCallbackID: 1,
                                auth_callbacks: {},
                                ScriptReceivers: d,
                                DependenciesReceivers: O,
                                getDefaultStrategy: Sy,
                                Transports: ey,
                                transportConnectionInitializer: Cy,
                                HTTPFactory: ml,
                                TimelineTransport: St,
                                getXHRAPI() {
                                    return window.XMLHttpRequest;
                                },
                                getWebSocketAPI() {
                                    return (
                                        window.WebSocket || window.MozWebSocket
                                    );
                                },
                                setup(f) {
                                    if (typeof window < "u") {
                                        window.Pusher = f;
                                        var o = () => {
                                            this.onDocumentBody(f.ready);
                                        };
                                        window.JSON
                                            ? o()
                                            : P.load("json2", {}, o);
                                    }
                                },
                                getDocument() {
                                    return document;
                                },
                                getProtocol() {
                                    return this.getDocument().location.protocol;
                                },
                                getAuthorizers() {
                                    return { ajax: ne, jsonp: xt };
                                },
                                onDocumentBody(f) {
                                    document.body
                                        ? f()
                                        : setTimeout(() => {
                                              this.onDocumentBody(f);
                                          }, 0);
                                },
                                createJSONPRequest(f, o) {
                                    return new _n(f, o);
                                },
                                createScriptRequest(f) {
                                    return new kt(f);
                                },
                                getLocalStorage() {
                                    try {
                                        return window.localStorage;
                                    } catch {
                                        return;
                                    }
                                },
                                createXHR() {
                                    return this.getXHRAPI()
                                        ? this.createXMLHttpRequest()
                                        : this.createMicrosoftXHR();
                                },
                                createXMLHttpRequest() {
                                    var f = this.getXHRAPI();
                                    return new f();
                                },
                                createMicrosoftXHR() {
                                    return new ActiveXObject(
                                        "Microsoft.XMLHTTP",
                                    );
                                },
                                getNetwork() {
                                    return ny;
                                },
                                createWebSocket(f) {
                                    var o = this.getWebSocketAPI();
                                    return new o(f);
                                },
                                createSocketRequest(f, o) {
                                    if (this.isXHRSupported())
                                        return this.HTTPFactory.createXHR(f, o);
                                    if (
                                        this.isXDRSupported(
                                            o.indexOf("https:") === 0,
                                        )
                                    )
                                        return this.HTTPFactory.createXDR(f, o);
                                    throw "Cross-origin HTTP requests are not supported";
                                },
                                isXHRSupported() {
                                    var f = this.getXHRAPI();
                                    return (
                                        !!f &&
                                        new f().withCredentials !== void 0
                                    );
                                },
                                isXDRSupported(f) {
                                    var o = f ? "https:" : "http:",
                                        l = this.getProtocol();
                                    return !!window.XDomainRequest && l === o;
                                },
                                addUnloadListener(f) {
                                    window.addEventListener !== void 0
                                        ? window.addEventListener(
                                              "pagehide",
                                              f,
                                              !1,
                                          )
                                        : window.attachEvent !== void 0 &&
                                          window.attachEvent("onunload", f);
                                },
                                removeUnloadListener(f) {
                                    window.addEventListener !== void 0
                                        ? window.removeEventListener(
                                              "pagehide",
                                              f,
                                              !1,
                                          )
                                        : window.detachEvent !== void 0 &&
                                          window.detachEvent("onunload", f);
                                },
                                randomInt(f) {
                                    const o = window.crypto || window.msCrypto,
                                        l = Math.floor(Math.pow(2, 32) / f) * f;
                                    let p;
                                    do
                                        p = o.getRandomValues(
                                            new Uint32Array(1),
                                        )[0];
                                    while (p >= l);
                                    return p % f;
                                },
                            };
                            const me = zy;
                            var Ki;
                            (function (f) {
                                ((f[(f.ERROR = 3)] = "ERROR"),
                                    (f[(f.INFO = 6)] = "INFO"),
                                    (f[(f.DEBUG = 7)] = "DEBUG"));
                            })(Ki || (Ki = {}));
                            const yr = Ki;
                            class Vy {
                                constructor(o, l, p) {
                                    ((this.key = o),
                                        (this.session = l),
                                        (this.events = []),
                                        (this.options = p || {}),
                                        (this.sent = 0),
                                        (this.uniqueID = 0));
                                }
                                log(o, l) {
                                    o <= this.options.level &&
                                        (this.events.push(
                                            He({}, l, { timestamp: Fe.now() }),
                                        ),
                                        this.options.limit &&
                                            this.events.length >
                                                this.options.limit &&
                                            this.events.shift());
                                }
                                error(o) {
                                    this.log(yr.ERROR, o);
                                }
                                info(o) {
                                    this.log(yr.INFO, o);
                                }
                                debug(o) {
                                    this.log(yr.DEBUG, o);
                                }
                                isEmpty() {
                                    return this.events.length === 0;
                                }
                                send(o, l) {
                                    var p = He(
                                        {
                                            session: this.session,
                                            bundle: this.sent + 1,
                                            key: this.key,
                                            lib: "js",
                                            version: this.options.version,
                                            cluster: this.options.cluster,
                                            features: this.options.features,
                                            timeline: this.events,
                                        },
                                        this.options.params,
                                    );
                                    return (
                                        (this.events = []),
                                        o(p, (_, N) => {
                                            (_ || this.sent++, l && l(_, N));
                                        }),
                                        !0
                                    );
                                }
                                generateUniqueID() {
                                    return (this.uniqueID++, this.uniqueID);
                                }
                            }
                            class Wy {
                                constructor(o, l, p, _) {
                                    ((this.name = o),
                                        (this.priority = l),
                                        (this.transport = p),
                                        (this.options = _ || {}));
                                }
                                isSupported() {
                                    return this.transport.isSupported({
                                        useTLS: this.options.useTLS,
                                    });
                                }
                                connect(o, l) {
                                    if (this.isSupported()) {
                                        if (this.priority < o)
                                            return gl(new J(), l);
                                    } else return gl(new Z(), l);
                                    var p = !1,
                                        _ = this.transport.createConnection(
                                            this.name,
                                            this.priority,
                                            this.options.key,
                                            this.options,
                                        ),
                                        N = null,
                                        q = function () {
                                            (_.unbind("initialized", q),
                                                _.connect());
                                        },
                                        Y = function () {
                                            N = sn.createHandshake(
                                                _,
                                                function (Ve) {
                                                    ((p = !0),
                                                        Ae(),
                                                        l(null, Ve));
                                                },
                                            );
                                        },
                                        pe = function (Ve) {
                                            (Ae(), l(Ve));
                                        },
                                        Te = function () {
                                            Ae();
                                            var Ve;
                                            ((Ve = Ce(_)), l(new oe(Ve)));
                                        },
                                        Ae = function () {
                                            (_.unbind("initialized", q),
                                                _.unbind("open", Y),
                                                _.unbind("error", pe),
                                                _.unbind("closed", Te));
                                        };
                                    return (
                                        _.bind("initialized", q),
                                        _.bind("open", Y),
                                        _.bind("error", pe),
                                        _.bind("closed", Te),
                                        _.initialize(),
                                        {
                                            abort: () => {
                                                p ||
                                                    (Ae(),
                                                    N ? N.close() : _.close());
                                            },
                                            forceMinPriority: (Ve) => {
                                                p ||
                                                    (this.priority < Ve &&
                                                        (N
                                                            ? N.close()
                                                            : _.close()));
                                            },
                                        }
                                    );
                                }
                            }
                            function gl(f, o) {
                                return (
                                    Fe.defer(function () {
                                        o(f);
                                    }),
                                    {
                                        abort: function () {},
                                        forceMinPriority: function () {},
                                    }
                                );
                            }
                            const { Transports: Ky } = me;
                            var Jy = function (f, o, l, p, _, N) {
                                    var q = Ky[l];
                                    if (!q) throw new z(l);
                                    var Y =
                                            (!f.enabledTransports ||
                                                y(f.enabledTransports, o) !==
                                                    -1) &&
                                            (!f.disabledTransports ||
                                                y(f.disabledTransports, o) ===
                                                    -1),
                                        pe;
                                    return (
                                        Y
                                            ? ((_ = Object.assign(
                                                  {
                                                      ignoreNullOrigin:
                                                          f.ignoreNullOrigin,
                                                  },
                                                  _,
                                              )),
                                              (pe = new Wy(
                                                  o,
                                                  p,
                                                  N ? N.getAssistant(q) : q,
                                                  _,
                                              )))
                                            : (pe = Xy),
                                        pe
                                    );
                                },
                                Xy = {
                                    isSupported: function () {
                                        return !1;
                                    },
                                    connect: function (f, o) {
                                        var l = Fe.defer(function () {
                                            o(new Z());
                                        });
                                        return {
                                            abort: function () {
                                                l.ensureAborted();
                                            },
                                            forceMinPriority: function () {},
                                        };
                                    },
                                };
                            function Gy(f) {
                                if (f == null)
                                    throw "You must pass an options object";
                                if (f.cluster == null)
                                    throw "Options object must provide a cluster";
                                "disableStats" in f &&
                                    de.warn(
                                        "The disableStats option is deprecated in favor of enableStats",
                                    );
                            }
                            const Zy = (f, o) => {
                                    var l =
                                        "socket_id=" +
                                        encodeURIComponent(f.socketId);
                                    for (var p in o.params)
                                        l +=
                                            "&" +
                                            encodeURIComponent(p) +
                                            "=" +
                                            encodeURIComponent(o.params[p]);
                                    if (o.paramsProvider != null) {
                                        let _ = o.paramsProvider();
                                        for (var p in _)
                                            l +=
                                                "&" +
                                                encodeURIComponent(p) +
                                                "=" +
                                                encodeURIComponent(_[p]);
                                    }
                                    return l;
                                },
                                Qy = (f) => {
                                    if (
                                        typeof me.getAuthorizers()[
                                            f.transport
                                        ] > "u"
                                    )
                                        throw `'${f.transport}' is not a recognized auth transport`;
                                    return (o, l) => {
                                        const p = Zy(o, f);
                                        me.getAuthorizers()[f.transport](
                                            me,
                                            p,
                                            f,
                                            g.UserAuthentication,
                                            l,
                                        );
                                    };
                                },
                                Yy = (f, o) => {
                                    var l =
                                        "socket_id=" +
                                        encodeURIComponent(f.socketId);
                                    l +=
                                        "&channel_name=" +
                                        encodeURIComponent(f.channelName);
                                    for (var p in o.params)
                                        l +=
                                            "&" +
                                            encodeURIComponent(p) +
                                            "=" +
                                            encodeURIComponent(o.params[p]);
                                    if (o.paramsProvider != null) {
                                        let _ = o.paramsProvider();
                                        for (var p in _)
                                            l +=
                                                "&" +
                                                encodeURIComponent(p) +
                                                "=" +
                                                encodeURIComponent(_[p]);
                                    }
                                    return l;
                                },
                                e_ = (f) => {
                                    if (
                                        typeof me.getAuthorizers()[
                                            f.transport
                                        ] > "u"
                                    )
                                        throw `'${f.transport}' is not a recognized auth transport`;
                                    return (o, l) => {
                                        const p = Yy(o, f);
                                        me.getAuthorizers()[f.transport](
                                            me,
                                            p,
                                            f,
                                            g.ChannelAuthorization,
                                            l,
                                        );
                                    };
                                },
                                t_ = (f, o, l) => {
                                    const p = {
                                        authTransport: o.transport,
                                        authEndpoint: o.endpoint,
                                        auth: {
                                            params: o.params,
                                            headers: o.headers,
                                        },
                                    };
                                    return (_, N) => {
                                        const q = f.channel(_.channelName);
                                        l(q, p).authorize(_.socketId, N);
                                    };
                                };
                            function bl(f, o) {
                                let l = {
                                    activityTimeout:
                                        f.activityTimeout || w.activityTimeout,
                                    cluster: f.cluster,
                                    httpPath: f.httpPath || w.httpPath,
                                    httpPort: f.httpPort || w.httpPort,
                                    httpsPort: f.httpsPort || w.httpsPort,
                                    pongTimeout: f.pongTimeout || w.pongTimeout,
                                    statsHost: f.statsHost || w.stats_host,
                                    unavailableTimeout:
                                        f.unavailableTimeout ||
                                        w.unavailableTimeout,
                                    wsPath: f.wsPath || w.wsPath,
                                    wsPort: f.wsPort || w.wsPort,
                                    wssPort: f.wssPort || w.wssPort,
                                    enableStats: o_(f),
                                    httpHost: n_(f),
                                    useTLS: i_(f),
                                    wsHost: s_(f),
                                    userAuthenticator: a_(f),
                                    channelAuthorizer: l_(f, o),
                                };
                                return (
                                    "disabledTransports" in f &&
                                        (l.disabledTransports =
                                            f.disabledTransports),
                                    "enabledTransports" in f &&
                                        (l.enabledTransports =
                                            f.enabledTransports),
                                    "ignoreNullOrigin" in f &&
                                        (l.ignoreNullOrigin =
                                            f.ignoreNullOrigin),
                                    "timelineParams" in f &&
                                        (l.timelineParams = f.timelineParams),
                                    "nacl" in f && (l.nacl = f.nacl),
                                    l
                                );
                            }
                            function n_(f) {
                                return f.httpHost
                                    ? f.httpHost
                                    : f.cluster
                                      ? `sockjs-${f.cluster}.pusher.com`
                                      : w.httpHost;
                            }
                            function s_(f) {
                                return f.wsHost ? f.wsHost : r_(f.cluster);
                            }
                            function r_(f) {
                                return `ws-${f}.pusher.com`;
                            }
                            function i_(f) {
                                return me.getProtocol() === "https:"
                                    ? !0
                                    : f.forceTLS !== !1;
                            }
                            function o_(f) {
                                return "enableStats" in f
                                    ? f.enableStats
                                    : "disableStats" in f
                                      ? !f.disableStats
                                      : !1;
                            }
                            const yl = (f) =>
                                "customHandler" in f && f.customHandler != null;
                            function a_(f) {
                                const o = Object.assign(
                                    Object.assign({}, w.userAuthentication),
                                    f.userAuthentication,
                                );
                                return yl(o) ? o.customHandler : Qy(o);
                            }
                            function c_(f, o) {
                                let l;
                                return (
                                    "channelAuthorization" in f
                                        ? (l = Object.assign(
                                              Object.assign(
                                                  {},
                                                  w.channelAuthorization,
                                              ),
                                              f.channelAuthorization,
                                          ))
                                        : ((l = {
                                              transport:
                                                  f.authTransport ||
                                                  w.authTransport,
                                              endpoint:
                                                  f.authEndpoint ||
                                                  w.authEndpoint,
                                          }),
                                          "auth" in f &&
                                              ("params" in f.auth &&
                                                  (l.params = f.auth.params),
                                              "headers" in f.auth &&
                                                  (l.headers = f.auth.headers)),
                                          "authorizer" in f &&
                                              (l.customHandler = t_(
                                                  o,
                                                  l,
                                                  f.authorizer,
                                              ))),
                                    l
                                );
                            }
                            function l_(f, o) {
                                const l = c_(f, o);
                                return yl(l) ? l.customHandler : e_(l);
                            }
                            class u_ extends nn {
                                constructor(o) {
                                    (super(function (l, p) {
                                        de.debug(
                                            `No callbacks on watchlist events for ${l}`,
                                        );
                                    }),
                                        (this.pusher = o),
                                        this.bindWatchlistInternalEvent());
                                }
                                handleEvent(o) {
                                    o.data.events.forEach((l) => {
                                        this.emit(l.name, l);
                                    });
                                }
                                bindWatchlistInternalEvent() {
                                    this.pusher.connection.bind(
                                        "message",
                                        (o) => {
                                            var l = o.event;
                                            l ===
                                                "pusher_internal:watchlist_events" &&
                                                this.handleEvent(o);
                                        },
                                    );
                                }
                            }
                            function f_() {
                                let f, o;
                                return {
                                    promise: new Promise((p, _) => {
                                        ((f = p), (o = _));
                                    }),
                                    resolve: f,
                                    reject: o,
                                };
                            }
                            const d_ = f_;
                            class h_ extends nn {
                                constructor(o) {
                                    (super(function (l, p) {
                                        de.debug(
                                            "No callbacks on user for " + l,
                                        );
                                    }),
                                        (this.signin_requested = !1),
                                        (this.user_data = null),
                                        (this.serverToUserChannel = null),
                                        (this.signinDonePromise = null),
                                        (this._signinDoneResolve = null),
                                        (this._onAuthorize = (l, p) => {
                                            if (l) {
                                                (de.warn(
                                                    `Error during signin: ${l}`,
                                                ),
                                                    this.emit(
                                                        "pusher:signin_error",
                                                        Object.assign(
                                                            {},
                                                            {
                                                                type: "AuthError",
                                                                error: l.message,
                                                            },
                                                            l instanceof Q
                                                                ? {
                                                                      status: l.status,
                                                                  }
                                                                : {},
                                                        ),
                                                    ),
                                                    this._cleanup());
                                                return;
                                            }
                                            this.pusher.send_event(
                                                "pusher:signin",
                                                {
                                                    auth: p.auth,
                                                    user_data: p.user_data,
                                                },
                                            );
                                        }),
                                        (this.pusher = o),
                                        this.pusher.connection.bind(
                                            "state_change",
                                            ({ previous: l, current: p }) => {
                                                (l !== "connected" &&
                                                    p === "connected" &&
                                                    this._signin(),
                                                    l === "connected" &&
                                                        p !== "connected" &&
                                                        (this._cleanup(),
                                                        this._newSigninPromiseIfNeeded()));
                                            },
                                        ),
                                        (this.watchlist = new u_(o)),
                                        this.pusher.connection.bind(
                                            "message",
                                            (l) => {
                                                var p = l.event;
                                                (p ===
                                                    "pusher:signin_success" &&
                                                    this._onSigninSuccess(
                                                        l.data,
                                                    ),
                                                    this.serverToUserChannel &&
                                                        this.serverToUserChannel
                                                            .name ===
                                                            l.channel &&
                                                        this.serverToUserChannel.handleEvent(
                                                            l,
                                                        ));
                                            },
                                        ));
                                }
                                signin() {
                                    this.signin_requested ||
                                        ((this.signin_requested = !0),
                                        this._signin());
                                }
                                _signin() {
                                    this.signin_requested &&
                                        (this._newSigninPromiseIfNeeded(),
                                        this.pusher.connection.state ===
                                            "connected" &&
                                            this.pusher.config.userAuthenticator(
                                                {
                                                    socketId:
                                                        this.pusher.connection
                                                            .socket_id,
                                                },
                                                this._onAuthorize,
                                            ));
                                }
                                _onSigninSuccess(o) {
                                    try {
                                        this.user_data = JSON.parse(
                                            o.user_data,
                                        );
                                    } catch {
                                        (de.error(
                                            `Failed parsing user data after signin: ${o.user_data}`,
                                        ),
                                            this._cleanup());
                                        return;
                                    }
                                    if (
                                        typeof this.user_data.id != "string" ||
                                        this.user_data.id === ""
                                    ) {
                                        (de.error(
                                            `user_data doesn't contain an id. user_data: ${this.user_data}`,
                                        ),
                                            this._cleanup());
                                        return;
                                    }
                                    (this._signinDoneResolve(),
                                        this._subscribeChannels());
                                }
                                _subscribeChannels() {
                                    const o = (l) => {
                                        l.subscriptionPending &&
                                        l.subscriptionCancelled
                                            ? l.reinstateSubscription()
                                            : !l.subscriptionPending &&
                                              this.pusher.connection.state ===
                                                  "connected" &&
                                              l.subscribe();
                                    };
                                    ((this.serverToUserChannel = new Fi(
                                        `#server-to-user-${this.user_data.id}`,
                                        this.pusher,
                                    )),
                                        this.serverToUserChannel.bind_global(
                                            (l, p) => {
                                                l.indexOf(
                                                    "pusher_internal:",
                                                ) === 0 ||
                                                    l.indexOf("pusher:") ===
                                                        0 ||
                                                    this.emit(l, p);
                                            },
                                        ),
                                        o(this.serverToUserChannel));
                                }
                                _cleanup() {
                                    ((this.user_data = null),
                                        this.serverToUserChannel &&
                                            (this.serverToUserChannel.unbind_all(),
                                            this.serverToUserChannel.disconnect(),
                                            (this.serverToUserChannel = null)),
                                        this.signin_requested &&
                                            this._signinDoneResolve());
                                }
                                _newSigninPromiseIfNeeded() {
                                    if (
                                        !this.signin_requested ||
                                        (this.signinDonePromise &&
                                            !this.signinDonePromise.done)
                                    )
                                        return;
                                    const { promise: o, resolve: l } = d_();
                                    o.done = !1;
                                    const p = () => {
                                        o.done = !0;
                                    };
                                    (o.then(p).catch(p),
                                        (this.signinDonePromise = o),
                                        (this._signinDoneResolve = l));
                                }
                            }
                            class tt {
                                static ready() {
                                    tt.isReady = !0;
                                    for (
                                        var o = 0, l = tt.instances.length;
                                        o < l;
                                        o++
                                    )
                                        tt.instances[o].connect();
                                }
                                static getClientFeatures() {
                                    return M(
                                        F(
                                            { ws: me.Transports.ws },
                                            function (o) {
                                                return o.isSupported({});
                                            },
                                        ),
                                    );
                                }
                                constructor(o, l) {
                                    (p_(o),
                                        Gy(l),
                                        (this.key = o),
                                        (this.options = l),
                                        (this.config = bl(this.options, this)),
                                        (this.channels = sn.createChannels()),
                                        (this.global_emitter = new nn()),
                                        (this.sessionID = me.randomInt(1e9)),
                                        (this.timeline = new Vy(
                                            this.key,
                                            this.sessionID,
                                            {
                                                cluster: this.config.cluster,
                                                features:
                                                    tt.getClientFeatures(),
                                                params:
                                                    this.config
                                                        .timelineParams || {},
                                                limit: 50,
                                                level: yr.INFO,
                                                version: w.VERSION,
                                            },
                                        )),
                                        this.config.enableStats &&
                                            (this.timelineSender =
                                                sn.createTimelineSender(
                                                    this.timeline,
                                                    {
                                                        host: this.config
                                                            .statsHost,
                                                        path:
                                                            "/timeline/v2/" +
                                                            me.TimelineTransport
                                                                .name,
                                                    },
                                                )));
                                    var p = (_) =>
                                        me.getDefaultStrategy(
                                            this.config,
                                            _,
                                            Jy,
                                        );
                                    ((this.connection =
                                        sn.createConnectionManager(this.key, {
                                            getStrategy: p,
                                            timeline: this.timeline,
                                            activityTimeout:
                                                this.config.activityTimeout,
                                            pongTimeout:
                                                this.config.pongTimeout,
                                            unavailableTimeout:
                                                this.config.unavailableTimeout,
                                            useTLS: !!this.config.useTLS,
                                        })),
                                        this.connection.bind(
                                            "connected",
                                            () => {
                                                (this.subscribeAll(),
                                                    this.timelineSender &&
                                                        this.timelineSender.send(
                                                            this.connection.isUsingTLS(),
                                                        ));
                                            },
                                        ),
                                        this.connection.bind("message", (_) => {
                                            var N = _.event,
                                                q =
                                                    N.indexOf(
                                                        "pusher_internal:",
                                                    ) === 0;
                                            if (_.channel) {
                                                var Y = this.channel(_.channel);
                                                Y && Y.handleEvent(_);
                                            }
                                            q ||
                                                this.global_emitter.emit(
                                                    _.event,
                                                    _.data,
                                                );
                                        }),
                                        this.connection.bind(
                                            "connecting",
                                            () => {
                                                this.channels.disconnect();
                                            },
                                        ),
                                        this.connection.bind(
                                            "disconnected",
                                            () => {
                                                this.channels.disconnect();
                                            },
                                        ),
                                        this.connection.bind("error", (_) => {
                                            de.warn(_);
                                        }),
                                        tt.instances.push(this),
                                        this.timeline.info({
                                            instances: tt.instances.length,
                                        }),
                                        (this.user = new h_(this)),
                                        tt.isReady && this.connect());
                                }
                                switchCluster(o) {
                                    const { appKey: l, cluster: p } = o;
                                    ((this.key = l),
                                        (this.options = Object.assign(
                                            Object.assign({}, this.options),
                                            { cluster: p },
                                        )),
                                        (this.config = bl(this.options, this)),
                                        this.connection.switchCluster(
                                            this.key,
                                        ));
                                }
                                channel(o) {
                                    return this.channels.find(o);
                                }
                                allChannels() {
                                    return this.channels.all();
                                }
                                connect() {
                                    if (
                                        (this.connection.connect(),
                                        this.timelineSender &&
                                            !this.timelineSenderTimer)
                                    ) {
                                        var o = this.connection.isUsingTLS(),
                                            l = this.timelineSender;
                                        this.timelineSenderTimer = new ze(
                                            6e4,
                                            function () {
                                                l.send(o);
                                            },
                                        );
                                    }
                                }
                                disconnect() {
                                    (this.connection.disconnect(),
                                        this.timelineSenderTimer &&
                                            (this.timelineSenderTimer.ensureAborted(),
                                            (this.timelineSenderTimer = null)));
                                }
                                bind(o, l, p) {
                                    return (
                                        this.global_emitter.bind(o, l, p),
                                        this
                                    );
                                }
                                unbind(o, l, p) {
                                    return (
                                        this.global_emitter.unbind(o, l, p),
                                        this
                                    );
                                }
                                bind_global(o) {
                                    return (
                                        this.global_emitter.bind_global(o),
                                        this
                                    );
                                }
                                unbind_global(o) {
                                    return (
                                        this.global_emitter.unbind_global(o),
                                        this
                                    );
                                }
                                unbind_all(o) {
                                    return (
                                        this.global_emitter.unbind_all(),
                                        this
                                    );
                                }
                                subscribeAll() {
                                    var o;
                                    for (o in this.channels.channels)
                                        this.channels.channels.hasOwnProperty(
                                            o,
                                        ) && this.subscribe(o);
                                }
                                subscribe(o) {
                                    var l = this.channels.add(o, this);
                                    return (
                                        l.subscriptionPending &&
                                        l.subscriptionCancelled
                                            ? l.reinstateSubscription()
                                            : !l.subscriptionPending &&
                                              this.connection.state ===
                                                  "connected" &&
                                              l.subscribe(),
                                        l
                                    );
                                }
                                unsubscribe(o) {
                                    var l = this.channels.find(o);
                                    l && l.subscriptionPending
                                        ? l.cancelSubscription()
                                        : ((l = this.channels.remove(o)),
                                          l && l.subscribed && l.unsubscribe());
                                }
                                send_event(o, l, p) {
                                    return this.connection.send_event(o, l, p);
                                }
                                shouldUseTLS() {
                                    return this.config.useTLS;
                                }
                                signin() {
                                    this.user.signin();
                                }
                            }
                            ((tt.instances = []),
                                (tt.isReady = !1),
                                (tt.logToConsole = !1),
                                (tt.Runtime = me),
                                (tt.ScriptReceivers = me.ScriptReceivers),
                                (tt.DependenciesReceivers =
                                    me.DependenciesReceivers),
                                (tt.auth_callbacks = me.auth_callbacks));
                            const _r = tt;
                            function p_(f) {
                                if (f == null)
                                    throw "You must pass your app key when you instantiate Pusher.";
                            }
                            me.setup(tt);
                        },
                    },
                    s = {};
                function r(a) {
                    var c = s[a];
                    if (c !== void 0) return c.exports;
                    var u = (s[a] = { exports: {} });
                    return (n[a].call(u.exports, u, u.exports, r), u.exports);
                }
                ((r.d = (a, c) => {
                    for (var u in c)
                        r.o(c, u) &&
                            !r.o(a, u) &&
                            Object.defineProperty(a, u, {
                                enumerable: !0,
                                get: c[u],
                            });
                }),
                    (r.o = (a, c) =>
                        Object.prototype.hasOwnProperty.call(a, c)));
                var i = r(721);
                return i;
            })(),
        );
    })(el);
    var Cg = el.exports;
    const Tg = Sg(Cg);
    window.Pusher = Tg;
    let an = null;
    const bs = new Map();
    function tl() {
        const e = { listen: () => e, whisper: () => e };
        return e;
    }
    const Eg = { private: () => tl(), join: () => tl(), leave: () => {} };
    function yn() {
        if (an) return nl();
        const e = window.ConverseConfig ?? {},
            t = e.reverb ?? {};
        try {
            ((an = new kg({
                broadcaster: "reverb",
                key: t.key,
                wsHost: t.host,
                wsPort: t.port ?? 80,
                wssPort: t.port ?? 443,
                forceTLS: (t.scheme ?? "https") === "https",
                enabledTransports: ["ws", "wss"],
            })),
                e.chatableType &&
                    e.chatableId &&
                    an
                        .private(`chatable.${e.chatableType}.${e.chatableId}`)
                        .listen(".conversation.created", () => {
                            bt().refresh();
                        })
                        .listen(".participant.added", (n) => {
                            var r;
                            ((r = n.chatables) == null
                                ? void 0
                                : r.some(
                                      (i) =>
                                          i.type === e.chatableType &&
                                          i.id === e.chatableId,
                                  )) && bt().refresh();
                        }));
        } catch (n) {
            (console.warn(
                "[converse] Realtime broadcasting is unavailable; live updates are disabled.",
                n,
            ),
                (an = Eg));
        }
        return nl();
    }
    function nl() {
        return {
            joinConversation: Pg,
            leaveConversation: Og,
            whisperTyping: Rg,
        };
    }
    function Pg(e) {
        if (bs.has(e)) return bs.get(e);
        const t = Be(),
            n = an
                .join(`conversation.${e}`)
                .listen(".message.sent", (s) => {
                    en(e, s);
                    const r = t.conversations.find((i) => i.id === e);
                    r &&
                        Bt({
                            ...r,
                            last_message: s,
                            last_activity_at: s.created_at,
                        });
                })
                .listen(".message.updated", (s) => {
                    en(e, { ...vr(e, s.id), ...s });
                })
                .listen(".message.deleted", (s) => {
                    const r = vr(e, s.id);
                    r && en(e, { ...r, deleted_for_everyone: !0, body: null });
                })
                .listen(".message.reacted", (s) => {
                    const r = vr(e, s.message_id);
                    r && en(e, { ...r, reactions: s.reactions });
                })
                .listen(".messages.delivered", () => {
                    sl(e, "delivered");
                })
                .listen(".messages.read", () => {
                    sl(e, "read");
                })
                .listen(".typing.start", (s) => {
                    const r = ut(s.chatable_type, s.chatable_id);
                    r !== t.currentKey && qa(e, r, !0);
                })
                .listen(".typing.stop", (s) => {
                    qa(e, ut(s.chatable_type, s.chatable_id), !1);
                })
                .listen(".presence.changed", (s) => {
                    za(ut(s.chatable_type, s.chatable_id), {
                        is_online: s.is_online,
                        last_seen_at: s.last_seen_at,
                    });
                })
                .listen(".participant.role_changed", () => {
                    bt().refreshOne(e);
                })
                .listen(".participant.removed", () => {
                    bt().refreshOne(e);
                })
                .listen(".message.pinned", (s) => {
                    const r = vr(e, s.id);
                    r && Va(e, r);
                })
                .listen(".message.unpinned", (s) => {
                    Wa(e, s.id);
                });
        return (bs.set(e, n), n);
    }
    function Og(e) {
        (an == null || an.leave(`conversation.${e}`), bs.delete(e));
    }
    function Rg(e, t) {
        var n;
        (n = bs.get(e)) == null || n.whisper("typing", { state: t });
    }
    function vr(e, t) {
        return (Be().messagesByConversation[e] ?? []).find((s) => s.id === t);
    }
    function sl(e, t) {
        const s = Be().messagesByConversation[e] ?? [];
        for (const r of s)
            (t === "read" || (t === "delivered" && r.status === "sent")) &&
                (r.status = t);
    }
    const Ui = {};
    function Ag() {
        function e(n) {
            (yn().whisperTyping(n, "start"),
                clearTimeout(Ui[n]),
                (Ui[n] = setTimeout(() => {
                    yn().whisperTyping(n, "stop");
                }, 4e3)));
        }
        function t(n) {
            (clearTimeout(Ui[n]), yn().whisperTyping(n, "stop"));
        }
        return { notifyTyping: e, stopTyping: t };
    }
    const $g = {
            class: "cv-composer border-t border-converse-border bg-converse-surface p-2",
        },
        Lg = {
            key: 1,
            class: "cv-composer__link-preview mb-2 rounded-cv border border-converse-border p-2 text-xs text-converse-textMuted",
        },
        Mg = { class: "cv-composer__emoji-wrap relative" },
        Ng = { key: 0, class: "absolute bottom-10 left-0 z-10" },
        Dg = {
            key: 1,
            type: "submit",
            class: "cv-composer__send rounded-full bg-converse-accent px-4 py-2 text-sm font-medium text-converse-accentContrast",
        },
        jg = {
            __name: "MessageComposer",
            props: {
                conversationId: { type: Number, required: !0 },
                replyTo: { type: Object, default: null },
            },
            emits: ["sent", "dismiss-reply"],
            setup(e, { emit: t }) {
                const n = e,
                    s = t,
                    { send: r } = bn(),
                    { notifyTyping: i, stopTyping: a } = Ag(),
                    c = Ot(),
                    u = G(""),
                    h = G(!1),
                    d = G(null);
                let v = null;
                Qe(u, (T) => {
                    (T.trim() && i(n.conversationId),
                        clearTimeout(v),
                        (v = setTimeout(() => w(T), 500)));
                });
                async function w(T) {
                    const m = T.match(/https?:\/\/\S+/);
                    if (!m) {
                        d.value = null;
                        return;
                    }
                    try {
                        const { data: g } = await c.post("/link-preview", {
                            url: m[0],
                        });
                        d.value = g.data;
                    } catch {
                        d.value = null;
                    }
                }
                function C(T) {
                    ((u.value += T), (h.value = !1));
                }
                async function O({ attachment: T, type: m }) {
                    var g;
                    (await r(n.conversationId, {
                        type: m,
                        attachment_ids: [T.id],
                        reply_to_message_id:
                            ((g = n.replyTo) == null ? void 0 : g.id) ?? null,
                    }),
                        s("sent"),
                        s("dismiss-reply"));
                }
                async function P({ attachment: T, durationSeconds: m }) {
                    (await r(n.conversationId, {
                        type: "voice",
                        attachment_ids: [T.id],
                        metadata: { duration: m },
                    }),
                        s("sent"));
                }
                async function A() {
                    var g;
                    const T = u.value.trim();
                    if (!T) return;
                    a(n.conversationId);
                    const m = d.value ? { link_preview: d.value } : null;
                    (await r(n.conversationId, {
                        type: "text",
                        body: T,
                        metadata: m,
                        reply_to_message_id:
                            ((g = n.replyTo) == null ? void 0 : g.id) ?? null,
                    }),
                        (u.value = ""),
                        (d.value = null),
                        s("sent"),
                        s("dismiss-reply"));
                }
                return (T, m) => (
                    E(),
                    $("div", $g, [
                        e.replyTo
                            ? (E(),
                              we(
                                  Fc,
                                  {
                                      key: 0,
                                      "reply-to": e.replyTo,
                                      dismissible: !0,
                                      class: "mb-2",
                                      onDismiss:
                                          m[0] ||
                                          (m[0] = (g) => s("dismiss-reply")),
                                  },
                                  null,
                                  8,
                                  ["reply-to"],
                              ))
                            : ee("", !0),
                        d.value
                            ? (E(),
                              $(
                                  "div",
                                  Lg,
                                  " Link preview: " +
                                      X(d.value.title || d.value.url),
                                  1,
                              ))
                            : ee("", !0),
                        S(
                            "form",
                            {
                                class: "cv-composer__form flex items-center gap-2",
                                onSubmit: Gs(A, ["prevent"]),
                            },
                            [
                                xe(ug, { onUploaded: O }),
                                S("div", Mg, [
                                    S(
                                        "button",
                                        {
                                            type: "button",
                                            class: "text-xl text-converse-textMuted hover:text-converse-accent",
                                            onClick:
                                                m[1] ||
                                                (m[1] = (g) =>
                                                    (h.value = !h.value)),
                                        },
                                        "😊",
                                    ),
                                    h.value
                                        ? (E(),
                                          $("div", Ng, [xe(ag, { onPick: C })]))
                                        : ee("", !0),
                                ]),
                                An(
                                    S(
                                        "input",
                                        {
                                            "onUpdate:modelValue":
                                                m[2] ||
                                                (m[2] = (g) => (u.value = g)),
                                            type: "text",
                                            placeholder: "Type a message",
                                            class: "cv-composer__input flex-1 rounded-full bg-converse-surfaceHover px-4 py-2 text-sm text-converse-text focus:outline-none",
                                        },
                                        null,
                                        512,
                                    ),
                                    [[Dn, u.value]],
                                ),
                                u.value.trim()
                                    ? (E(), $("button", Dg, "Send"))
                                    : (E(), we(fg, { key: 0, onRecorded: P })),
                            ],
                            32,
                        ),
                    ])
                );
            },
        },
        Ig = { class: "cv-disappearing-toggle" },
        Ug = ["value"],
        Bg = ["value"],
        Fg = {
            __name: "DisappearingToggle",
            props: { conversation: { type: Object, required: !0 } },
            setup(e) {
                const t = e,
                    { setDisappearing: n } = bt(),
                    s = [
                        { label: "Off", value: "" },
                        { label: "24 hours", value: 86400 },
                        { label: "7 days", value: 604800 },
                        { label: "90 days", value: 7776e3 },
                    ],
                    r = ve(
                        () => t.conversation.disappearing_messages_ttl ?? "",
                    );
                function i(a) {
                    const c = a.target.value;
                    n(t.conversation.id, c === "" ? null : Number(c));
                }
                return (a, c) => (
                    E(),
                    $("div", Ig, [
                        c[0] ||
                            (c[0] = S(
                                "label",
                                {
                                    class: "mb-1 block text-xs font-medium text-converse-textMuted",
                                },
                                "Disappearing messages",
                                -1,
                            )),
                        S(
                            "select",
                            {
                                value: r.value,
                                class: "w-full rounded border border-converse-border px-2 py-1.5 text-sm",
                                onChange: i,
                            },
                            [
                                (E(),
                                $(
                                    be,
                                    null,
                                    Ue(s, (u) =>
                                        S(
                                            "option",
                                            { key: u.label, value: u.value },
                                            X(u.label),
                                            9,
                                            Bg,
                                        ),
                                    ),
                                    64,
                                )),
                            ],
                            40,
                            Ug,
                        ),
                    ])
                );
            },
        };
    function Hg() {
        const e = Ot();
        async function t(i) {
            const { data: a } = await e.get(`/conversations/${i}/participants`);
            return a.data;
        }
        async function n(i, a) {
            const { data: c } = await e.post(
                `/conversations/${i}/participants`,
                { participants: a.map((u) => ({ type: u.type, id: u.id })) },
            );
            return c.data;
        }
        async function s(i, a, c) {
            await e.delete(`/conversations/${i}/participants/${a}/${c}`);
        }
        async function r(i, a, c, u) {
            await e.patch(`/conversations/${i}/participants/${a}/${c}/role`, {
                role: u,
            });
        }
        return { list: t, add: n, remove: s, changeRole: r };
    }
    const qg = {
            class: "cv-group-info-panel fixed inset-0 z-40 overflow-y-auto bg-converse-surface p-3 sm:static sm:z-auto sm:w-72 sm:shrink-0 sm:border-l sm:border-converse-border",
        },
        zg = {
            class: "cv-group-info-panel__header mb-3 flex items-center justify-between",
        },
        Vg = {
            class: "cv-group-info-panel__avatar mb-4 flex flex-col items-center",
        },
        Wg = { class: "mt-2 font-medium" },
        Kg = { key: 0, class: "text-center text-xs text-converse-textMuted" },
        Jg = {
            key: 0,
            class: "cv-group-info-panel__error mb-2 rounded bg-converse-danger/10 p-2 text-xs text-converse-danger",
        },
        Xg = { class: "cv-group-info-panel__disappearing mb-4" },
        Gg = { class: "cv-group-info-panel__wallpaper mb-4" },
        Zg = {
            class: "cv-group-info-panel__wallpaper-swatches flex flex-wrap gap-2",
        },
        Qg = ["title", "onClick"],
        Yg = {
            class: "cv-group-info-panel__wallpaper-custom relative h-7 w-7 cursor-pointer rounded-full border-2 border-converse-border",
            title: "Custom color",
        },
        eb = {
            class: "cv-group-info-panel__participants-header mb-2 flex items-center justify-between",
        },
        tb = { key: 0, class: "cv-group-info-panel__add-member-form mb-3" },
        nb = ["disabled"],
        sb = { class: "cv-group-info-panel__participants-list" },
        rb = { class: "min-w-0 flex-1" },
        ib = { class: "truncate text-sm" },
        ob = { key: 0, class: "text-xs text-converse-textMuted" },
        ab = { key: 0, class: "flex gap-1" },
        cb = ["onClick"],
        lb = ["onClick"],
        ub = {
            __name: "GroupInfoPanel",
            props: { conversation: { type: Object, required: !0 } },
            emits: ["close"],
            setup(e, { emit: t }) {
                const n = e,
                    s = t,
                    r = Be(),
                    { resolve: i, get: a } = tn(),
                    { add: c, remove: u, changeRole: h } = Hg(),
                    { block: d, unblock: v, list: w } = Hc(),
                    { refreshOne: C, leave: O, setWallpaper: P } = bt(),
                    A = G(!1),
                    T = G([]),
                    m = G(""),
                    g = G([]),
                    b = ve(() => n.conversation.type === "group"),
                    L = ve(() => {
                        var se;
                        return (se = n.conversation.me) == null
                            ? void 0
                            : se.role;
                    }),
                    B = ve(() => L.value === "admin");
                function J(se) {
                    return Yt(se) === r.currentKey;
                }
                const oe = ve(() =>
                        b.value
                            ? null
                            : ((n.conversation.participants ?? []).find(
                                  (se) => !J(se),
                              ) ?? null),
                    ),
                    ie = ve(() => {
                        const se = oe.value;
                        return se
                            ? a({ type: se.chatable_type, id: se.chatable_id })
                            : null;
                    }),
                    z = ve(() => {
                        const se = oe.value;
                        return se
                            ? g.value.includes(
                                  ut(se.chatable_type, se.chatable_id),
                              )
                            : !1;
                    });
                async function Z() {
                    const se = (n.conversation.participants ?? []).map(
                        (ae) => ({
                            type: ae.chatable_type,
                            id: ae.chatable_id,
                        }),
                    );
                    if ((se.length && (await i(se)), !b.value)) {
                        const ae = await w();
                        g.value = ae.map((fe) =>
                            ut(fe.blocked_type, fe.blocked_id),
                        );
                    }
                }
                (jt(Z), Qe(() => n.conversation.id, Z));
                async function Q() {
                    var se, ae;
                    m.value = "";
                    try {
                        (await c(n.conversation.id, T.value),
                            await C(n.conversation.id),
                            (A.value = !1),
                            (T.value = []));
                    } catch (fe) {
                        m.value =
                            ((ae =
                                (se = fe.response) == null
                                    ? void 0
                                    : se.data) == null
                                ? void 0
                                : ae.message) ?? "Could not add members.";
                    }
                }
                async function K(se) {
                    var ae, fe;
                    m.value = "";
                    try {
                        (await u(
                            n.conversation.id,
                            se.chatable_type,
                            se.chatable_id,
                        ),
                            await C(n.conversation.id));
                    } catch (Ne) {
                        m.value =
                            ((fe =
                                (ae = Ne.response) == null
                                    ? void 0
                                    : ae.data) == null
                                ? void 0
                                : fe.message) ?? "Could not remove member.";
                    }
                }
                async function ne(se) {
                    var ae, fe;
                    m.value = "";
                    try {
                        (await h(
                            n.conversation.id,
                            se.chatable_type,
                            se.chatable_id,
                            se.role === "admin" ? "member" : "admin",
                        ),
                            await C(n.conversation.id));
                    } catch (Ne) {
                        m.value =
                            ((fe =
                                (ae = Ne.response) == null
                                    ? void 0
                                    : ae.data) == null
                                ? void 0
                                : fe.message) ?? "Could not change role.";
                    }
                }
                async function et() {
                    var se, ae;
                    m.value = "";
                    try {
                        (await O(n.conversation.id), s("close"));
                    } catch (fe) {
                        m.value =
                            ((ae =
                                (se = fe.response) == null
                                    ? void 0
                                    : se.data) == null
                                ? void 0
                                : ae.message) ?? "Could not leave the group.";
                    }
                }
                async function Oe(se) {
                    await P(n.conversation.id, se === "default" ? null : se);
                }
                async function _e(se) {
                    await P(n.conversation.id, se.target.value);
                }
                async function Se() {
                    const se = oe.value;
                    if (!se) return;
                    const ae = ut(se.chatable_type, se.chatable_id);
                    z.value
                        ? (await v(se.chatable_type, se.chatable_id),
                          (g.value = g.value.filter((fe) => fe !== ae)))
                        : (await d({
                              type: se.chatable_type,
                              id: se.chatable_id,
                          }),
                          g.value.push(ae));
                }
                return (se, ae) => {
                    var fe, Ne, ft, wt;
                    return (
                        E(),
                        $("div", qg, [
                            S("div", zg, [
                                ae[3] ||
                                    (ae[3] = S(
                                        "h2",
                                        { class: "font-medium" },
                                        "Info",
                                        -1,
                                    )),
                                S(
                                    "button",
                                    {
                                        type: "button",
                                        class: "text-converse-textMuted hover:text-converse-textMuted",
                                        onClick:
                                            ae[0] ||
                                            (ae[0] = (Re) => s("close")),
                                    },
                                    "×",
                                ),
                            ]),
                            S("div", Vg, [
                                xe(
                                    Qt,
                                    {
                                        name: b.value
                                            ? e.conversation.name || "Group"
                                            : (((fe = ie.value) == null
                                                  ? void 0
                                                  : fe.name) ?? ""),
                                        "avatar-url": b.value
                                            ? e.conversation.avatar_url
                                            : (Ne = ie.value) == null
                                              ? void 0
                                              : Ne.avatar_url,
                                        size: 72,
                                    },
                                    null,
                                    8,
                                    ["name", "avatar-url"],
                                ),
                                S(
                                    "p",
                                    Wg,
                                    X(
                                        b.value
                                            ? e.conversation.name || "Group"
                                            : (ft = ie.value) == null
                                              ? void 0
                                              : ft.name,
                                    ),
                                    1,
                                ),
                                e.conversation.description
                                    ? (E(),
                                      $(
                                          "p",
                                          Kg,
                                          X(e.conversation.description),
                                          1,
                                      ))
                                    : ee("", !0),
                            ]),
                            m.value
                                ? (E(), $("p", Jg, X(m.value), 1))
                                : ee("", !0),
                            S("div", Xg, [
                                xe(
                                    Fg,
                                    { conversation: e.conversation },
                                    null,
                                    8,
                                    ["conversation"],
                                ),
                            ]),
                            S("div", Gg, [
                                ae[5] ||
                                    (ae[5] = S(
                                        "h3",
                                        {
                                            class: "mb-2 text-xs font-medium uppercase text-converse-textMuted",
                                        },
                                        "Chat wallpaper",
                                        -1,
                                    )),
                                S("div", Zg, [
                                    (E(!0),
                                    $(
                                        be,
                                        null,
                                        Ue(ge(Wc), (Re) => {
                                            var le;
                                            return (
                                                E(),
                                                $(
                                                    "button",
                                                    {
                                                        key: Re.key,
                                                        type: "button",
                                                        title: Re.label,
                                                        class: Le([
                                                            "h-7 w-7 rounded-full border-2",
                                                            (((le =
                                                                e.conversation
                                                                    .me) == null
                                                                ? void 0
                                                                : le.wallpaper) ??
                                                                "default") ===
                                                            Re.key
                                                                ? "border-converse-accent"
                                                                : "border-converse-border",
                                                        ]),
                                                        style: $t({
                                                            backgroundColor:
                                                                Re.css ??
                                                                "transparent",
                                                        }),
                                                        onClick: (ze) =>
                                                            Oe(Re.key),
                                                    },
                                                    null,
                                                    14,
                                                    Qg,
                                                )
                                            );
                                        }),
                                        128,
                                    )),
                                    S("label", Yg, [
                                        S(
                                            "input",
                                            {
                                                type: "color",
                                                class: "absolute inset-0 h-full w-full cursor-pointer opacity-0",
                                                onInput: _e,
                                            },
                                            null,
                                            32,
                                        ),
                                        ae[4] ||
                                            (ae[4] = S(
                                                "span",
                                                {
                                                    class: "pointer-events-none absolute inset-0 flex items-center justify-center text-xs",
                                                },
                                                "🎨",
                                                -1,
                                            )),
                                    ]),
                                ]),
                            ]),
                            b.value
                                ? (E(),
                                  $(
                                      be,
                                      { key: 1 },
                                      [
                                          S("div", eb, [
                                              ae[6] ||
                                                  (ae[6] = S(
                                                      "h3",
                                                      {
                                                          class: "text-xs font-medium uppercase text-converse-textMuted",
                                                      },
                                                      "Participants",
                                                      -1,
                                                  )),
                                              B.value
                                                  ? (E(),
                                                    $(
                                                        "button",
                                                        {
                                                            key: 0,
                                                            type: "button",
                                                            class: "text-xs text-converse-accent",
                                                            onClick:
                                                                ae[1] ||
                                                                (ae[1] = (Re) =>
                                                                    (A.value =
                                                                        !A.value)),
                                                        },
                                                        " Add ",
                                                    ))
                                                  : ee("", !0),
                                          ]),
                                          A.value
                                              ? (E(),
                                                $("div", tb, [
                                                    xe(
                                                        ur,
                                                        {
                                                            modelValue: T.value,
                                                            "onUpdate:modelValue":
                                                                ae[2] ||
                                                                (ae[2] = (Re) =>
                                                                    (T.value =
                                                                        Re)),
                                                            multiple: !0,
                                                        },
                                                        null,
                                                        8,
                                                        ["modelValue"],
                                                    ),
                                                    S(
                                                        "button",
                                                        {
                                                            type: "button",
                                                            class: "mt-2 w-full rounded bg-converse-accent py-1.5 text-sm text-white disabled:opacity-50",
                                                            disabled:
                                                                !T.value.length,
                                                            onClick: Q,
                                                        },
                                                        " Add selected ",
                                                        8,
                                                        nb,
                                                    ),
                                                ]))
                                              : ee("", !0),
                                          S("ul", sb, [
                                              (E(!0),
                                              $(
                                                  be,
                                                  null,
                                                  Ue(
                                                      e.conversation
                                                          .participants,
                                                      (Re) => (
                                                          E(),
                                                          $(
                                                              "li",
                                                              {
                                                                  key: ge(Yt)(
                                                                      Re,
                                                                  ),
                                                                  class: "cv-group-info-panel__participant-row flex items-center gap-2 py-1.5",
                                                              },
                                                              [
                                                                  xe(
                                                                      Qt,
                                                                      {
                                                                          name: ge(
                                                                              a,
                                                                          )({
                                                                              type: Re.chatable_type,
                                                                              id: Re.chatable_id,
                                                                          })
                                                                              .name,
                                                                          "avatar-url":
                                                                              ge(
                                                                                  a,
                                                                              )(
                                                                                  {
                                                                                      type: Re.chatable_type,
                                                                                      id: Re.chatable_id,
                                                                                  },
                                                                              )
                                                                                  .avatar_url,
                                                                          size: 32,
                                                                      },
                                                                      null,
                                                                      8,
                                                                      [
                                                                          "name",
                                                                          "avatar-url",
                                                                      ],
                                                                  ),
                                                                  S("div", rb, [
                                                                      S(
                                                                          "p",
                                                                          ib,
                                                                          X(
                                                                              ge(
                                                                                  a,
                                                                              )(
                                                                                  {
                                                                                      type: Re.chatable_type,
                                                                                      id: Re.chatable_id,
                                                                                  },
                                                                              )
                                                                                  .name,
                                                                          ),
                                                                          1,
                                                                      ),
                                                                      Re.role ===
                                                                      "admin"
                                                                          ? (E(),
                                                                            $(
                                                                                "p",
                                                                                ob,
                                                                                "Admin",
                                                                            ))
                                                                          : ee(
                                                                                "",
                                                                                !0,
                                                                            ),
                                                                  ]),
                                                                  B.value &&
                                                                  !J(Re)
                                                                      ? (E(),
                                                                        $(
                                                                            "div",
                                                                            ab,
                                                                            [
                                                                                S(
                                                                                    "button",
                                                                                    {
                                                                                        type: "button",
                                                                                        class: "text-xs text-converse-accent",
                                                                                        onClick:
                                                                                            (
                                                                                                le,
                                                                                            ) =>
                                                                                                ne(
                                                                                                    Re,
                                                                                                ),
                                                                                    },
                                                                                    X(
                                                                                        Re.role ===
                                                                                            "admin"
                                                                                            ? "Demote"
                                                                                            : "Promote",
                                                                                    ),
                                                                                    9,
                                                                                    cb,
                                                                                ),
                                                                                S(
                                                                                    "button",
                                                                                    {
                                                                                        type: "button",
                                                                                        class: "text-xs text-converse-danger",
                                                                                        onClick:
                                                                                            (
                                                                                                le,
                                                                                            ) =>
                                                                                                K(
                                                                                                    Re,
                                                                                                ),
                                                                                    },
                                                                                    "Remove",
                                                                                    8,
                                                                                    lb,
                                                                                ),
                                                                            ],
                                                                        ))
                                                                      : ee(
                                                                            "",
                                                                            !0,
                                                                        ),
                                                              ],
                                                          )
                                                      ),
                                                  ),
                                                  128,
                                              )),
                                          ]),
                                          S(
                                              "button",
                                              {
                                                  type: "button",
                                                  class: "cv-group-info-panel__leave-button mt-4 w-full rounded border border-converse-danger/30 py-1.5 text-sm text-converse-danger",
                                                  onClick: et,
                                              },
                                              " Leave group ",
                                          ),
                                      ],
                                      64,
                                  ))
                                : (E(),
                                  $(
                                      "button",
                                      {
                                          key: 2,
                                          type: "button",
                                          class: Le([
                                              "cv-group-info-panel__block-button w-full rounded border py-1.5 text-sm",
                                              z.value
                                                  ? "border-converse-border text-converse-textMuted"
                                                  : "border-converse-danger/30 text-converse-danger",
                                          ]),
                                          onClick: Se,
                                      },
                                      X(z.value ? "Unblock" : "Block") +
                                          " " +
                                          X(
                                              (wt = ie.value) == null
                                                  ? void 0
                                                  : wt.name,
                                          ),
                                      3,
                                  )),
                        ])
                    );
                };
            },
        },
        fb = {
            key: 0,
            class: "cv-chat-window-empty flex h-full items-center justify-center bg-converse-chatBg text-converse-textMuted",
        },
        db = { key: 1, class: "cv-chat-window flex h-full" },
        hb = { class: "cv-chat-window__main flex h-full flex-1 flex-col" },
        pb = {
            key: 0,
            class: "cv-chat-window__inline-search border-b border-converse-border bg-converse-surface px-3 py-2",
        },
        vb = {
            key: 1,
            class: "cv-chat-window__pinned-banner border-b border-converse-border bg-converse-surface",
        },
        mb = ["onClick"],
        gb = { class: "flex-1 truncate text-xs text-converse-textMuted" },
        bb = ["onClick"],
        yb = {
            key: 2,
            class: "cv-chat-window__search-results flex-1 overflow-y-auto bg-converse-chatBg p-3",
        },
        _b = { class: "mb-2 text-xs text-converse-textMuted" },
        wb = { key: 0, class: "text-sm text-converse-textMuted" },
        xb = {
            key: 4,
            class: "cv-chat-window__edit-bar border-t border-converse-border bg-converse-warning p-2",
        },
        kb = { class: "cv-chat-window__edit-actions flex gap-2" },
        Sb = ["value"],
        Cb = {
            __name: "ChatWindow",
            props: { messageSearchQuery: { type: String, default: "" } },
            setup(e) {
                const t = e,
                    n = Be(),
                    { setActive: s } = bt(),
                    {
                        load: r,
                        update: i,
                        markDelivered: a,
                        markRead: c,
                        search: u,
                    } = bn(),
                    { list: h, unpin: d, pinnedFor: v } = Uc(),
                    w = G(null),
                    C = G(null),
                    O = G(!1),
                    P = G([]),
                    A = G(!1),
                    T = G(""),
                    m = ve(() =>
                        n.conversations.find(
                            (Q) => Q.id === n.activeConversationId,
                        ),
                    ),
                    g = ve(() => (A.value ? T.value : t.messageSearchQuery));
                function b() {
                    ((A.value = !A.value), A.value || (T.value = ""));
                }
                Qe(
                    () => n.activeConversationId,
                    async (Q, K) => {
                        if (
                            ((w.value = null),
                            (C.value = null),
                            (O.value = !1),
                            K && yn().leaveConversation(K),
                            Q)
                        ) {
                            (yn().joinConversation(Q),
                                await r(Q),
                                await a(Q),
                                await h(Q));
                            const ne = n.messagesByConversation[Q] ?? [];
                            ne.length && (await c(Q, ne[ne.length - 1].id));
                        }
                    },
                    { immediate: !0 },
                );
                const L = ve(() => (m.value ? v(m.value.id) : []));
                function B(Q) {
                    var K;
                    (K = document.getElementById(`cv-message-${Q}`)) == null ||
                        K.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                }
                async function J(Q) {
                    await d(Q);
                }
                (Qe(g, async (Q) => {
                    Q && m.value
                        ? (P.value = await u(Q, m.value.id))
                        : (P.value = []);
                }),
                    ts(() => {
                        n.activeConversationId &&
                            yn().leaveConversation(n.activeConversationId);
                    }));
                function oe() {
                    s(null);
                }
                function ie(Q) {
                    ((w.value = Q), (C.value = null));
                }
                function z(Q) {
                    C.value = Q;
                }
                async function Z(Q) {
                    C.value &&
                        (await i(C.value.id, C.value.conversation_id, Q),
                        (C.value = null));
                }
                return (Q, K) =>
                    m.value
                        ? (E(),
                          $("div", db, [
                              S("div", hb, [
                                  xe(
                                      eg,
                                      {
                                          conversation: m.value,
                                          "search-open": A.value,
                                          onBack: oe,
                                          onOpenInfo:
                                              K[0] ||
                                              (K[0] = (ne) =>
                                                  (O.value = !O.value)),
                                          onToggleSearch: b,
                                      },
                                      null,
                                      8,
                                      ["conversation", "search-open"],
                                  ),
                                  A.value
                                      ? (E(),
                                        $("div", pb, [
                                            An(
                                                S(
                                                    "input",
                                                    {
                                                        "onUpdate:modelValue":
                                                            K[1] ||
                                                            (K[1] = (ne) =>
                                                                (T.value = ne)),
                                                        type: "text",
                                                        autofocus: "",
                                                        placeholder:
                                                            "Search in this chat",
                                                        class: "w-full rounded-full bg-converse-surfaceHover px-4 py-1.5 text-sm text-converse-text focus:outline-none",
                                                    },
                                                    null,
                                                    512,
                                                ),
                                                [[Dn, T.value]],
                                            ),
                                        ]))
                                      : ee("", !0),
                                  L.value.length
                                      ? (E(),
                                        $("div", vb, [
                                            (E(!0),
                                            $(
                                                be,
                                                null,
                                                Ue(
                                                    L.value,
                                                    (ne) => (
                                                        E(),
                                                        $(
                                                            "div",
                                                            {
                                                                key: ne.id,
                                                                class: "cv-chat-window__pinned-item flex cursor-pointer items-center gap-2 border-b border-converse-border px-3 py-1.5 last:border-b-0 hover:bg-converse-surfaceHover",
                                                                onClick: (et) =>
                                                                    B(ne.id),
                                                            },
                                                            [
                                                                K[9] ||
                                                                    (K[9] = S(
                                                                        "span",
                                                                        {
                                                                            class: "text-xs",
                                                                        },
                                                                        "📌",
                                                                        -1,
                                                                    )),
                                                                S(
                                                                    "span",
                                                                    gb,
                                                                    X(
                                                                        ne.deleted_for_everyone
                                                                            ? "This message was deleted"
                                                                            : ne.type ===
                                                                                "text"
                                                                              ? ne.body
                                                                              : `[${ne.type}]`,
                                                                    ),
                                                                    1,
                                                                ),
                                                                S(
                                                                    "button",
                                                                    {
                                                                        type: "button",
                                                                        class: "cv-chat-window__pinned-unpin text-xs text-converse-textMuted hover:text-converse-danger",
                                                                        onClick:
                                                                            Gs(
                                                                                (
                                                                                    et,
                                                                                ) =>
                                                                                    J(
                                                                                        ne,
                                                                                    ),
                                                                                [
                                                                                    "stop",
                                                                                ],
                                                                            ),
                                                                    },
                                                                    "✕",
                                                                    8,
                                                                    bb,
                                                                ),
                                                            ],
                                                            8,
                                                            mb,
                                                        )
                                                    ),
                                                ),
                                                128,
                                            )),
                                        ]))
                                      : ee("", !0),
                                  g.value
                                      ? (E(),
                                        $("div", yb, [
                                            S(
                                                "p",
                                                _b,
                                                'Results for "' +
                                                    X(g.value) +
                                                    '"',
                                                1,
                                            ),
                                            (E(!0),
                                            $(
                                                be,
                                                null,
                                                Ue(
                                                    P.value,
                                                    (ne) => (
                                                        E(),
                                                        we(
                                                            Oi,
                                                            {
                                                                key: ne.id,
                                                                message: ne,
                                                            },
                                                            null,
                                                            8,
                                                            ["message"],
                                                        )
                                                    ),
                                                ),
                                                128,
                                            )),
                                            P.value.length
                                                ? ee("", !0)
                                                : (E(),
                                                  $(
                                                      "p",
                                                      wb,
                                                      "No messages found.",
                                                  )),
                                        ]))
                                      : (E(),
                                        we(
                                            rg,
                                            {
                                                key: 3,
                                                "conversation-id": m.value.id,
                                                class: "flex-1",
                                                onReply: ie,
                                                onEdit: z,
                                            },
                                            null,
                                            8,
                                            ["conversation-id"],
                                        )),
                                  C.value
                                      ? (E(),
                                        $("div", xb, [
                                            K[10] ||
                                                (K[10] = S(
                                                    "p",
                                                    {
                                                        class: "mb-1 text-xs text-converse-textMuted",
                                                    },
                                                    "Editing message",
                                                    -1,
                                                )),
                                            S("div", kb, [
                                                S(
                                                    "input",
                                                    {
                                                        value: C.value.body,
                                                        type: "text",
                                                        class: "flex-1 rounded border border-converse-border px-2 py-1 text-sm",
                                                        onKeyup:
                                                            K[2] ||
                                                            (K[2] = Yf(
                                                                (ne) =>
                                                                    Z(
                                                                        ne
                                                                            .target
                                                                            .value,
                                                                    ),
                                                                ["enter"],
                                                            )),
                                                        onInput:
                                                            K[3] ||
                                                            (K[3] = (ne) =>
                                                                (C.value.body =
                                                                    ne.target.value)),
                                                    },
                                                    null,
                                                    40,
                                                    Sb,
                                                ),
                                                S(
                                                    "button",
                                                    {
                                                        type: "button",
                                                        class: "text-sm text-converse-accent",
                                                        onClick:
                                                            K[4] ||
                                                            (K[4] = (ne) =>
                                                                Z(
                                                                    C.value
                                                                        .body,
                                                                )),
                                                    },
                                                    "Save",
                                                ),
                                                S(
                                                    "button",
                                                    {
                                                        type: "button",
                                                        class: "text-sm text-converse-textMuted",
                                                        onClick:
                                                            K[5] ||
                                                            (K[5] = (ne) =>
                                                                (C.value =
                                                                    null)),
                                                    },
                                                    "Cancel",
                                                ),
                                            ]),
                                        ]))
                                      : (E(),
                                        we(
                                            jg,
                                            {
                                                key: 5,
                                                "conversation-id": m.value.id,
                                                "reply-to": w.value,
                                                onDismissReply:
                                                    K[6] ||
                                                    (K[6] = (ne) =>
                                                        (w.value = null)),
                                            },
                                            null,
                                            8,
                                            ["conversation-id", "reply-to"],
                                        )),
                              ]),
                              O.value
                                  ? (E(),
                                    we(
                                        ub,
                                        {
                                            key: 0,
                                            conversation: m.value,
                                            onClose:
                                                K[7] ||
                                                (K[7] = (ne) => (O.value = !1)),
                                        },
                                        null,
                                        8,
                                        ["conversation"],
                                    ))
                                  : ee("", !0),
                          ]))
                        : (E(),
                          $("div", fb, [
                              ...(K[8] ||
                                  (K[8] = [
                                      S(
                                          "p",
                                          null,
                                          "Select a conversation to start chatting.",
                                          -1,
                                      ),
                                  ])),
                          ]));
            },
        };
    function rl() {
        const e = Ot(),
            t = Be();
        async function n() {
            if (!t.currentKey || t.usersById[t.currentKey])
                return t.usersById[t.currentKey] ?? null;
            const { data: r } = await e.get("/users", {
                params: { type: t.currentType, ids: [t.currentId] },
            });
            return (Zs(r.data), t.usersById[t.currentKey] ?? null);
        }
        async function s(r) {
            const i = new FormData();
            i.append("avatar", r);
            const { data: a } = await e.post("/profile/avatar", i, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return (Zs([a.data]), a.data);
        }
        return { ensureSelfCached: n, updateAvatar: s };
    }
    function Tb() {
        const e = Ot();
        async function t() {
            const { data: s } = await e.get("/profile/settings");
            return s.data;
        }
        async function n(s) {
            const { data: r } = await e.patch("/profile/settings", s);
            return r.data;
        }
        return { get: t, update: n };
    }
    function il(e, { min: t = 240, max: n = 480, invert: s = !1 } = {}) {
        let r = !1,
            i = 0,
            a = 0;
        function c(d) {
            if (!r) return;
            const v = d.clientX - i,
                w = a + (s ? -v : v);
            e.value = Math.min(n, Math.max(t, w));
        }
        function u() {
            ((r = !1),
                document.removeEventListener("pointermove", c),
                document.removeEventListener("pointerup", u));
        }
        function h(d) {
            ((r = !0),
                (i = d.clientX),
                (a = e.value),
                document.addEventListener("pointermove", c),
                document.addEventListener("pointerup", u),
                d.preventDefault());
        }
        return (ts(u), { startDrag: h });
    }
    const Eb = {
            class: "cv-settings-panel__header mb-4 flex items-center justify-between",
        },
        Pb = {
            class: "cv-settings-panel__avatar mb-6 flex flex-col items-center gap-2",
        },
        Ob = {
            class: "cv-settings-panel__avatar-upload cursor-pointer text-sm text-converse-accent",
        },
        Rb = ["disabled"],
        Ab = {
            key: 0,
            class: "cv-settings-panel__avatar-error text-xs text-converse-danger",
        },
        $b = {
            class: "cv-settings-panel__theme mb-3 flex items-center justify-between rounded-cv border border-converse-border p-3",
        },
        Lb = ["aria-checked"],
        Mb = {
            class: "cv-settings-panel__privacy rounded-cv border border-converse-border",
        },
        Nb = {
            class: "cv-settings-panel__privacy-row flex items-center justify-between border-b border-converse-border p-3",
        },
        Db = ["aria-checked"],
        jb = {
            class: "cv-settings-panel__privacy-row flex items-center justify-between p-3",
        },
        Ib = ["aria-checked"],
        Ub = {
            __name: "SettingsPanel",
            emits: ["close"],
            setup(e, { emit: t }) {
                const n = t,
                    s = Be(),
                    { updateAvatar: r } = rl(),
                    { theme: i, toggleTheme: a, settingsPanelWidth: c } = Mi(),
                    { startDrag: u } = il(c, { invert: !0 }),
                    { get: h, update: d } = Tb(),
                    v = G(""),
                    w = G(!1),
                    C = G(!0),
                    O = G(!0),
                    P = ve(() => s.usersById[s.currentKey] ?? null);
                jt(async () => {
                    const g = await h();
                    ((C.value = g.show_last_seen),
                        (O.value = g.show_read_receipts));
                });
                async function A(g) {
                    var L, B, J;
                    const b = (L = g.target.files) == null ? void 0 : L[0];
                    if (b) {
                        ((v.value = ""), (w.value = !0));
                        try {
                            await r(b);
                        } catch (oe) {
                            v.value =
                                ((J =
                                    (B = oe.response) == null
                                        ? void 0
                                        : B.data) == null
                                    ? void 0
                                    : J.message) ?? "Could not update photo.";
                        } finally {
                            ((w.value = !1), (g.target.value = ""));
                        }
                    }
                }
                async function T() {
                    ((C.value = !C.value),
                        await d({ show_last_seen: C.value }));
                }
                async function m() {
                    ((O.value = !O.value),
                        await d({ show_read_receipts: O.value }));
                }
                return (g, b) => {
                    var L, B;
                    return (
                        E(),
                        $(
                            "div",
                            {
                                class: "cv-settings-panel fixed inset-0 z-40 overflow-y-auto bg-converse-surface p-4 sm:static sm:z-auto sm:w-[var(--panel-width)] sm:shrink-0 sm:border-l sm:border-converse-border",
                                style: $t({ "--panel-width": ge(c) + "px" }),
                            },
                            [
                                S(
                                    "div",
                                    {
                                        class: "cv-settings-panel__resize-handle absolute inset-y-0 left-0 hidden w-2 cursor-col-resize sm:block",
                                        onPointerdown:
                                            b[0] ||
                                            (b[0] = (...J) =>
                                                ge(u) && ge(u)(...J)),
                                    },
                                    null,
                                    32,
                                ),
                                S("div", Eb, [
                                    b[3] ||
                                        (b[3] = S(
                                            "h2",
                                            {
                                                class: "font-medium text-converse-text",
                                            },
                                            "Settings",
                                            -1,
                                        )),
                                    S(
                                        "button",
                                        {
                                            type: "button",
                                            class: "cv-settings-panel__close text-converse-textMuted hover:text-converse-text",
                                            onClick:
                                                b[1] ||
                                                (b[1] = (J) => n("close")),
                                        },
                                        "×",
                                    ),
                                ]),
                                S("div", Pb, [
                                    xe(
                                        Qt,
                                        {
                                            name:
                                                ((L = P.value) == null
                                                    ? void 0
                                                    : L.name) ?? "",
                                            "avatar-url":
                                                (B = P.value) == null
                                                    ? void 0
                                                    : B.avatar_url,
                                            size: 88,
                                        },
                                        null,
                                        8,
                                        ["name", "avatar-url"],
                                    ),
                                    S("label", Ob, [
                                        ri(
                                            X(
                                                w.value
                                                    ? "Uploading…"
                                                    : "Change photo",
                                            ) + " ",
                                            1,
                                        ),
                                        S(
                                            "input",
                                            {
                                                type: "file",
                                                accept: "image/*",
                                                class: "hidden",
                                                disabled: w.value,
                                                onChange: A,
                                            },
                                            null,
                                            40,
                                            Rb,
                                        ),
                                    ]),
                                    v.value
                                        ? (E(), $("p", Ab, X(v.value), 1))
                                        : ee("", !0),
                                ]),
                                S("div", $b, [
                                    b[4] ||
                                        (b[4] = S(
                                            "span",
                                            {
                                                class: "text-sm text-converse-text",
                                            },
                                            "Dark mode",
                                            -1,
                                        )),
                                    S(
                                        "button",
                                        {
                                            type: "button",
                                            class: Le([
                                                "cv-settings-panel__theme-switch relative h-6 w-11 rounded-full transition-colors",
                                                ge(i) === "dark"
                                                    ? "bg-converse-accent"
                                                    : "bg-converse-border",
                                            ]),
                                            role: "switch",
                                            "aria-checked": ge(i) === "dark",
                                            onClick:
                                                b[2] ||
                                                (b[2] = (...J) =>
                                                    ge(a) && ge(a)(...J)),
                                        },
                                        [
                                            S(
                                                "span",
                                                {
                                                    class: Le([
                                                        "cv-settings-panel__theme-knob absolute top-0.5 h-5 w-5 rounded-full bg-converse-surface transition-transform",
                                                        ge(i) === "dark"
                                                            ? "translate-x-5"
                                                            : "translate-x-0.5",
                                                    ]),
                                                },
                                                null,
                                                2,
                                            ),
                                        ],
                                        10,
                                        Lb,
                                    ),
                                ]),
                                S("div", Mb, [
                                    S("div", Nb, [
                                        b[5] ||
                                            (b[5] = S(
                                                "span",
                                                {
                                                    class: "text-sm text-converse-text",
                                                },
                                                "Show my last seen & online status",
                                                -1,
                                            )),
                                        S(
                                            "button",
                                            {
                                                type: "button",
                                                class: Le([
                                                    "cv-settings-panel__last-seen-switch relative h-6 w-11 shrink-0 rounded-full transition-colors",
                                                    C.value
                                                        ? "bg-converse-accent"
                                                        : "bg-converse-border",
                                                ]),
                                                role: "switch",
                                                "aria-checked": C.value,
                                                onClick: T,
                                            },
                                            [
                                                S(
                                                    "span",
                                                    {
                                                        class: Le([
                                                            "absolute top-0.5 h-5 w-5 rounded-full bg-converse-surface transition-transform",
                                                            C.value
                                                                ? "translate-x-5"
                                                                : "translate-x-0.5",
                                                        ]),
                                                    },
                                                    null,
                                                    2,
                                                ),
                                            ],
                                            10,
                                            Db,
                                        ),
                                    ]),
                                    S("div", jb, [
                                        b[6] ||
                                            (b[6] = S(
                                                "span",
                                                {
                                                    class: "text-sm text-converse-text",
                                                },
                                                "Show my read receipts",
                                                -1,
                                            )),
                                        S(
                                            "button",
                                            {
                                                type: "button",
                                                class: Le([
                                                    "cv-settings-panel__read-receipts-switch relative h-6 w-11 shrink-0 rounded-full transition-colors",
                                                    O.value
                                                        ? "bg-converse-accent"
                                                        : "bg-converse-border",
                                                ]),
                                                role: "switch",
                                                "aria-checked": O.value,
                                                onClick: m,
                                            },
                                            [
                                                S(
                                                    "span",
                                                    {
                                                        class: Le([
                                                            "absolute top-0.5 h-5 w-5 rounded-full bg-converse-surface transition-transform",
                                                            O.value
                                                                ? "translate-x-5"
                                                                : "translate-x-0.5",
                                                        ]),
                                                    },
                                                    null,
                                                    2,
                                                ),
                                            ],
                                            10,
                                            Ib,
                                        ),
                                    ]),
                                ]),
                            ],
                            4,
                        )
                    );
                };
            },
        },
        Bb = {
            class: "cv-app-shell flex h-screen w-screen overflow-hidden text-converse-text",
        },
        Fb = {
            __name: "AppShell",
            setup(e) {
                const t = Be(),
                    n = G(""),
                    s = G(!1),
                    { sidebarWidth: r } = Mi(),
                    { startDrag: i } = il(r, { invert: !1 }),
                    { view: a } = fi();
                function c(u) {
                    n.value = u;
                }
                return (u, h) => (
                    E(),
                    $("div", Bb, [
                        S(
                            "div",
                            {
                                class: Le([
                                    "cv-app-shell__rail-wrap shrink-0",
                                    {
                                        hidden: ge(t).activeConversationId,
                                        "sm:block": !0,
                                    },
                                ]),
                            },
                            [
                                xe(fd, {
                                    onOpenProfile:
                                        h[0] || (h[0] = (d) => (s.value = !0)),
                                }),
                            ],
                            2,
                        ),
                        S(
                            "div",
                            {
                                class: Le([
                                    "cv-app-shell__sidebar relative w-full border-r border-converse-border sm:w-[var(--sidebar-width)] sm:shrink-0",
                                    {
                                        hidden: ge(t).activeConversationId,
                                        "sm:block": !0,
                                    },
                                ]),
                                style: $t({ "--sidebar-width": ge(r) + "px" }),
                            },
                            [
                                ge(a) === "chats"
                                    ? (E(),
                                      we(Im, {
                                          key: 0,
                                          onMessageSearch: c,
                                          onOpenSettings:
                                              h[1] ||
                                              (h[1] = (d) => (s.value = !0)),
                                      }))
                                    : (E(), we(Wm, { key: 1 })),
                                S(
                                    "div",
                                    {
                                        class: "cv-app-shell__sidebar-resize-handle absolute inset-y-0 -right-1 z-10 hidden w-2 cursor-col-resize sm:block",
                                        onPointerdown:
                                            h[2] ||
                                            (h[2] = (...d) =>
                                                ge(i) && ge(i)(...d)),
                                    },
                                    null,
                                    32,
                                ),
                            ],
                            6,
                        ),
                        S(
                            "div",
                            {
                                class: Le([
                                    "cv-app-shell__main flex-1",
                                    {
                                        hidden: !ge(t).activeConversationId,
                                        "sm:block": !0,
                                    },
                                ]),
                            },
                            [
                                xe(
                                    Cb,
                                    { "message-search-query": n.value },
                                    null,
                                    8,
                                    ["message-search-query"],
                                ),
                            ],
                            2,
                        ),
                        s.value
                            ? (E(),
                              we(Ub, {
                                  key: 0,
                                  onClose:
                                      h[3] || (h[3] = (d) => (s.value = !1)),
                              }))
                            : ee("", !0),
                    ])
                );
            },
        };
    nd({
        __name: "App",
        setup(e) {
            const t = window.ConverseConfig ?? {};
            od(t.chatableType ?? null, t.chatableId ?? null);
            const n = Vc();
            return (
                jt(() => {
                    (yn(), n.start(), rl().ensureSelfCached());
                }),
                ts(() => {
                    n.stop();
                }),
                (s, r) => (E(), we(Fb))
            );
        },
    }).mount("#converse-chat-app");
})();
