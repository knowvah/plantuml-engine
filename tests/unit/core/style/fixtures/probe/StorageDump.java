import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;

import net.sourceforge.plantuml.BlockUml;
import net.sourceforge.plantuml.SourceStringReader;
import net.sourceforge.plantuml.TitledDiagram;
import net.sourceforge.plantuml.core.Diagram;
import net.sourceforge.plantuml.style.PName;
import net.sourceforge.plantuml.style.Style;
import net.sourceforge.plantuml.style.StyleBuilder;
import net.sourceforge.plantuml.style.StyleKey;
import net.sourceforge.plantuml.style.Value;

/**
 * Dumps the StyleBuilder storage (StyleStorage#getStyles, iteration order) of
 * the diagram parsed from argv[0] in the shape of
 * tests/unit/core/style/fixtures/*-storage.json. Run against the OLD-engine
 * stock jar (97a5992); put a directory holding skin/plantuml.skin first on
 * the classpath to load another skin through the same engine.
 */
public class StorageDump {
	static Object field(Object o, String name) throws Exception {
		Class<?> c = o.getClass();
		while (c != null) {
			try {
				Field f = c.getDeclaredField(name);
				f.setAccessible(true);
				return f.get(o);
			} catch (NoSuchFieldException e) {
				c = c.getSuperclass();
			}
		}
		throw new NoSuchFieldException(name);
	}

	static String q(String s) {
		if (s == null)
			return "null";
		StringBuilder sb = new StringBuilder("\"");
		for (char ch : s.toCharArray()) {
			if (ch == '"' || ch == '\\')
				sb.append('\\').append(ch);
			else if (ch < 0x20)
				sb.append(String.format("\\u%04x", (int) ch));
			else
				sb.append(ch);
		}
		return sb.append('"').toString();
	}

	public static void main(String[] args) throws Exception {
		String src = new String(Files.readAllBytes(Paths.get(args[0])), "UTF-8");
		SourceStringReader r = new SourceStringReader(src);
		BlockUml b = r.getBlocks().get(0);
		Diagram d = b.getDiagram();
		StyleBuilder sb = ((TitledDiagram) d).getCurrentStyleBuilder();
		Object storage = field(sb, "storage");
		@SuppressWarnings("unchecked")
		Collection<Style> styles = (Collection<Style>) storage.getClass().getMethod("getStyles").invoke(storage);
		String storageJson = stylesJson(styles);
		if (args.length < 2 || !args[1].equals("ideas")) {
			System.out.println(storageJson);
			return;
		}
		// {storage, ideas}: every Idea.getStyle(), regular branch then reverse, preorder
		List<String> ideas = new ArrayList<>();
		for (Object mm : (List<?>) field(d, "mindmaps"))
			for (String br : new String[] { "regular", "reverse" }) {
				Object root = field(field(mm, br), "root");
				if (root != null)
					walk(root, br, ideas);
			}
		System.out.println("{\"storage\":" + storageJson + ",\"ideas\":[\n" + String.join(",\n", ideas) + "\n]}");
	}

	static void walk(Object idea, String branch, List<String> out) throws Exception {
		Object label = field(idea, "label");
		StringBuilder lab = new StringBuilder();
		for (Object cs : (List<?>) field(label, "displayData"))
			lab.append(cs.toString());
		java.lang.reflect.Method gl = idea.getClass().getMethod("getLevel");
		gl.setAccessible(true);
		java.lang.reflect.Method gs = idea.getClass().getMethod("getStyle");
		gs.setAccessible(true);
		int level = (Integer) gl.invoke(idea);
		Style st = (Style) gs.invoke(idea);
		out.add("{\"branch\":" + q(branch) + ",\"label\":" + q(lab.toString()) + ",\"level\":" + level + ",\"style\":"
				+ styleJson(st) + "}");
		for (Object c : (List<?>) field(idea, "children"))
			walk(c, branch, out);
	}

	static String stylesJson(Collection<Style> styles) throws Exception {
		List<String> out = new ArrayList<>();
		for (Style st : styles)
			out.add(styleJson(st));
		return "[\n" + String.join(",\n", out) + "\n]";
	}

	static String styleJson(Style st) throws Exception {
		{
			StyleKey key = st.getSignature().getKey();
			StringBuilder s = new StringBuilder("{\"snames\":[");
			boolean first = true;
			for (Object n : key.snames) {
				s.append(first ? "" : ",").append(q(n.toString()));
				first = false;
			}
			s.append("],\"level\":").append(key.level).append(",\"star\":").append(key.isStared);
			s.append(",\"stereotypes\":[");
			first = true;
			for (String t : new TreeSet<>(st.getSignature().getStereotypes())) {
				s.append(first ? "" : ",").append(q(t));
				first = false;
			}
			s.append("],\"values\":{");
			@SuppressWarnings("unchecked")
			Map<PName, Value> map = (Map<PName, Value>) field(st, "map");
			first = true;
			for (PName p : PName.values()) {
				Value v = map.get(p);
				if (v == null)
					continue;
				Object ds = field(v, "value");
				String txt = ds.toString();
				int slash = txt.lastIndexOf(" (");
				String prio = txt.substring(slash + 2, txt.length() - 1);
				Object v1 = field(ds, "value1");
				Object v2 = field(ds, "value2");
				s.append(first ? "" : ",").append(q(p.name())).append(":[").append(q((String) v1)).append(",")
						.append(q((String) v2)).append(",").append(prio).append("]");
				first = false;
			}
			s.append("}}");
			return s.toString();
		}
	}
}
