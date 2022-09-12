package org.vaadin.artur.polymertolit;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.apache.commons.io.IOUtils;
import org.jboss.forge.roaster.Roaster;
import org.jboss.forge.roaster.model.source.JavaClassSource;

public class Parser {
    public static void main(String[] args) throws IOException {
        String in = args[0];
        String source = read(in);
        String out = transform(source);
        System.out.println(out);
    }

    static String transform(String source) throws IOException {
        JavaClassSource javaClass = Roaster.parse(JavaClassSource.class, source);
        javaClass.setSuperType("com.vaadin.flow.component.littemplate.LitTemplate");

        String result = javaClass.toUnformattedString();
        return result;
    }

    private static String readResource(String resource) throws IOException {
        return IOUtils
                .toString(Parser.class.getClassLoader().getResourceAsStream(resource),
                        StandardCharsets.UTF_8);
    }

    private static String read(String filename) throws IOException {
        try (FileInputStream stream = new FileInputStream(new File(filename))) {
            return IOUtils
                    .toString(stream,
                            StandardCharsets.UTF_8);
        }
    }
}
