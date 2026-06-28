package com.company.app;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;

class AppEngineTest {

    private final AppEngine engine = new AppEngine();

    @Test
    void testDeltaCalculation() {
        assertEquals(15, engine.calculateDelta(5, 5));
        assertEquals(0, engine.calculateDelta(0, 0));
        assertEquals(-4, engine.calculateDelta(-10, 3));
    }

    @Test
    void testReverse() {
        assertEquals("cba", engine.reverse("abc"));
        assertEquals("", engine.reverse(""));
        assertNull(engine.reverse(null));
    }
}
