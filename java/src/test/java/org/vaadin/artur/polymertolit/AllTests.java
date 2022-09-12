package org.vaadin.artur.polymertolit;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class AllTests {

    @Test
    public void noModel() throws IOException {
        test("NoModel.java");
    }

    @Test
    public void basicGettersSetters() throws IOException {
        test("BasicGettersSetters.java");
    }

    private void test(String inFile) throws IOException {
        String source = IOUtils.toString(getClass().getResourceAsStream("/in/" + inFile), StandardCharsets.UTF_8);
        String expected = IOUtils.toString(getClass().getResourceAsStream("/expected/" + inFile),
                StandardCharsets.UTF_8);
        String result = Transformer.transform(source);
        Assertions.assertEquals(expected, result);
    }
}
