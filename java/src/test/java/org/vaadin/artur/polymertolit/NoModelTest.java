package org.vaadin.artur.polymertolit;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

public class NoModelTest {

    @Test
    public void noModel() throws IOException {
        test("in/NoModel.java");
    }

    private void test(String inFile) throws IOException {
        String source = IOUtils.toString(getClass().getResourceAsStream("/" + inFile), StandardCharsets.UTF_8);
        String expected = IOUtils.toString(getClass().getResourceAsStream("/" + inFile.replace("in/", "expected/")),
                StandardCharsets.UTF_8);
        String result = Parser.transform(source);
        Assertions.assertEquals(expected, result);
    }
}
